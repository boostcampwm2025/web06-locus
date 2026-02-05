import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OutboxService } from '@/outbox/outbox.service';
import { UsersService } from '@/users/users.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';
import { GetAllRecordsDto } from './dto/get-all-records.dto';
import { GetRecordsByLocationDto } from './dto/get-records-by-location.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { RecordListResponseDto } from './dto/records-list-reponse.dto';
import { SearchRecordListResponseDto } from './dto/search-record-list-response.dto';
import { UpdateFavoriteResponseDto } from './dto/update-favorite.response.dto';
import {
  LocationInfo,
  RecordModel,
  RecordModelWithoutCoords,
} from './records.types';
import {
  InvalidBoundsException,
  RecordAccessDeniedException,
  RecordCreationFailedException,
  RecordDeletionFailedException,
  RecordNotFoundException,
} from './exceptions/record.exceptions';
import { Prisma } from '@prisma/client';
import {
  createRecordFavoriteSyncPayload,
  createRecordConnectionsCountSyncPayload,
  createRecordSyncPayload,
} from './type/record-sync.types';
import {
  AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
} from '@/common/constants/event-types.constants';
import { nanoid } from 'nanoid';
import {
  ImageUrls,
  ProcessedImage,
  UploadedImage,
} from './services/object-storage.types';
import { RecordSearchService } from './services/records-search.service';
import { RecordTagsService } from './services/records-tags.service';
import { RecordImageService } from './services/records-image.service';
import { RecordQueryService } from './services/records-query.service';
import { RecordGraphService } from './services/records-graph.service';
import { RecordLocationService } from './services/records-location.service';
import { ObjectStorageService } from './services/object-storage.service';
import { RedisService } from '@/redis/redis.service';
import { GraphResponseDto } from './dto/graph.response.dto';
@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly usersService: UsersService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly recordSearchService: RecordSearchService,
    private readonly recordTagsService: RecordTagsService,
    private readonly recordImageService: RecordImageService,
    private readonly recordQueryService: RecordQueryService,
    private readonly recordGraphService: RecordGraphService,
    private readonly recordLocationService: RecordLocationService,
    private readonly redisService: RedisService,
  ) {}

  async createRecord(
    userId: bigint,
    dto: CreateRecordDto,
    images?: Express.Multer.File[],
  ): Promise<RecordResponseDto> {
    if (images?.length) {
      return this.createRecordWithImages(userId, dto, images);
    }
    return this.createRecordWithoutImages(userId, dto);
  }

  async updateRecord(
    userId: bigint,
    publicId: string,
    dto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    const { record, tags, images } = await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.record.findFirst({ where: { publicId } });

        if (!existing) throw new RecordNotFoundException(publicId);
        if (existing.userId !== userId)
          throw new RecordAccessDeniedException(publicId);

        let locationName = existing.locationName;
        let locationAddress = existing.locationAddress;

        if (dto.location) {
          const locationInfo = await this.recordLocationService.getLocationInfo(
            dto.location.latitude,
            dto.location.longitude,
          );
          locationName = locationInfo.name;
          locationAddress = locationInfo.address;
        }

        const updated = await tx.record.update({
          where: { id: existing.id },
          data: {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.content !== undefined && { content: dto.content }),
            ...(dto.location && { locationName, locationAddress }),
          },
        });

        const updatedRecord = dto.location
          ? await this.recordLocationService.updateRecordLocation(
              tx,
              updated.id,
              dto.location.latitude,
              dto.location.longitude,
            )
          : await this.recordLocationService.getRecordWithLocation(
              tx,
              existing.id,
              updated,
            );

        const tags =
          dto.tags !== undefined
            ? await this.recordTagsService.updateRecordTags(
                tx,
                userId,
                updatedRecord.id,
                dto.tags,
              )
            : await this.recordTagsService.getRecordTags(updatedRecord.id);

        const imagesMap = await this.recordImageService.getImagesByRecordIds({
          recordIds: [updatedRecord.id],
          tx,
        });
        const images = imagesMap.get(updatedRecord.id) ?? [];

        const tagNames = tags.map((t) => t.name);

        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: updatedRecord.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_UPDATED,
          payload: createRecordSyncPayload(
            userId,
            updatedRecord,
            tagNames,
            images[0]?.thumbnailUrl,
          ),
        });

        return { record: updatedRecord, tags, images };
      },
    );

    return RecordResponseDto.of(record, tags, images);
  }

  async updateFavoriteInRecord(
    userId: bigint,
    publicId: string,
    requestedIsFavorite: boolean,
  ): Promise<UpdateFavoriteResponseDto> {
    const record = await this.findOneByPublicId(publicId);

    if (record.userId !== userId) {
      throw new RecordAccessDeniedException(publicId);
    }

    if (record.isFavorite === requestedIsFavorite) {
      return { publicId, isFavorite: record.isFavorite };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.record.update({
        where: { id: record.id },
        data: { isFavorite: requestedIsFavorite },
        select: { id: true, isFavorite: true, publicId: true },
      });

      await this.outboxService.publish(tx, {
        aggregateType: AGGREGATE_TYPE.RECORD,
        aggregateId: updatedRecord.id.toString(),
        eventType: OUTBOX_EVENT_TYPE.RECORD_FAVORITE_UPDATED,
        payload: createRecordFavoriteSyncPayload(
          updatedRecord.id,
          updatedRecord.isFavorite,
        ),
      });

      return updatedRecord;
    });

    return { publicId: updated.publicId, isFavorite: updated.isFavorite };
  }

  async incrementConnectionsCount(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    delta: number,
  ) {
    const updated = await tx.record.update({
      where: { id: recordId },
      data: { connectionsCount: { increment: delta } },
      select: { id: true, connectionsCount: true },
    });

    await this.outboxService.publish(tx, {
      aggregateType: AGGREGATE_TYPE.RECORD,
      aggregateId: updated.id.toString(),
      eventType: OUTBOX_EVENT_TYPE.RECORD_CONNECTIONS_COUNT_UPDATED,
      payload: createRecordConnectionsCountSyncPayload(
        updated.id,
        updated.connectionsCount,
      ),
    });

    return updated;
  }

  async deleteRecord(userId: bigint, publicId: string): Promise<void> {
    const record = await this.prisma.record.findUnique({
      where: { publicId },
      select: {
        id: true,
        userId: true,
        publicId: true,
        images: {
          select: {
            thumbnailUrl: true,
            mediumUrl: true,
            originalUrl: true,
          },
        },
      },
    });

    if (!record) throw new RecordNotFoundException(publicId);
    if (record.userId !== userId)
      throw new RecordAccessDeniedException(publicId);

    const imageUrls: ImageUrls[] = record.images.map((img) => ({
      thumbnail: img.thumbnailUrl,
      medium: img.mediumUrl,
      original: img.originalUrl,
    }));

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.record.delete({ where: { id: record.id } });

        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: record.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_DELETED,
          payload: { publicId, userId: userId.toString() },
        });
      });
      await this.recordImageService.deleteImagesFromStorage(imageUrls);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete record: publicId=${publicId}`,
          error.stack,
        );
        throw new RecordDeletionFailedException(error);
      }
      throw new Error('Unexpected non-Error exception thrown');
    }

    this.logger.log(`Record deleted: publicId=${publicId}, userId=${userId}`);
  }

  async findOneByPublicId(publicId: string) {
    const record = await this.prisma.record.findUnique({ where: { publicId } });

    if (!record) throw new RecordNotFoundException(publicId);

    return record;
  }

  async getRecordDetail(
    userId: bigint,
    publicId: string,
  ): Promise<RecordResponseDto> {
    const record = await this.findOneByPublicId(publicId);

    if (record.userId !== userId) {
      throw new RecordAccessDeniedException(publicId);
    }

    const recordWithLocation =
      await this.recordLocationService.getRecordWithLocation(
        this.prisma,
        record.id,
        record,
      );

    const [tags, imagesMap] = await Promise.all([
      this.recordTagsService.getRecordTags(record.id),
      this.recordImageService.getImagesByRecordIds({ recordIds: [record.id] }),
    ]);
    const images = imagesMap.get(record.id) ?? [];

    return RecordResponseDto.of(recordWithLocation, tags, images);
  }

  async getRecordsInBounds(
    userId: bigint,
    dto: GetRecordsQueryDto,
  ): Promise<RecordListResponseDto> {
    if (dto.neLat <= dto.swLat) {
      throw new InvalidBoundsException(
        '북동쪽 위도가 남서쪽 위도보다 작거나 같습니다.',
      );
    }

    const offset = (dto.page - 1) * dto.limit;

    const { records, totalCount } =
      await this.recordQueryService.getRecordsInBounds(
        userId,
        {
          swLng: dto.swLng,
          swLat: dto.swLat,
          neLng: dto.neLng,
          neLat: dto.neLat,
        },
        { limit: dto.limit, offset },
        dto.sortOrder,
      );

    return this.buildRecordListResponse(records, totalCount);
  }

  async getRecordsByLocation(
    userId: bigint,
    dto: GetRecordsByLocationDto,
  ): Promise<RecordListResponseDto> {
    const offset = (dto.page - 1) * dto.limit;

    const { records, totalCount } =
      await this.recordQueryService.getRecordsByLocation(
        userId,
        {
          latitude: dto.latitude,
          longitude: dto.longitude,
          radius: dto.radius,
        },
        { limit: dto.limit, offset },
        dto.sortOrder,
      );

    return this.buildRecordListResponse(records, totalCount);
  }

  async getAllRecords(
    userId: bigint,
    dto: GetAllRecordsDto,
  ): Promise<RecordListResponseDto> {
    const offset = (dto.page - 1) * dto.limit;

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? this.getEndOfDay(dto.endDate) : undefined;
    const tagIds = await this.recordTagsService.convertTagPublicIdsToIds(
      userId,
      dto.tagPublicIds,
    );

    const { records, totalCount } = await this.recordQueryService.getAllRecords(
      userId,
      { startDate, endDate, tagIds },
      { limit: dto.limit, offset },
      dto.sortOrder,
    );

    return this.buildRecordListResponse(records, totalCount, true);
  }

  async searchRecords(
    userId: bigint,
    dto: SearchRecordsDto,
  ): Promise<SearchRecordListResponseDto> {
    const originalSize = dto.size ?? 20;
    const {
      hits: { hits, total },
    } = await this.recordSearchService.search(userId, {
      ...dto,
      size: originalSize + 1,
    });

    const totalCount = typeof total === 'number' ? total : (total?.value ?? 0);
    const hasMore = hits.length > originalSize;
    const finalHits = hasMore ? hits.slice(0, originalSize) : hits;

    let nextCursor: string | null = null;
    if (hasMore && finalHits.length > 0) {
      const lastSortValues = finalHits[finalHits.length - 1].sort;
      nextCursor = Buffer.from(JSON.stringify(lastSortValues)).toString(
        'base64',
      );
    }

    return SearchRecordListResponseDto.of(
      finalHits,
      hasMore,
      nextCursor,
      totalCount,
    );
  }

  async getGraph(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphResponseDto> {
    const recordCachingId = this.redisService.makeCachingRecordKey(
      userId,
      startRecordPublicId,
    );

    // 캐시 확인
    const cachedGraphId = await this.redisService.get(recordCachingId);

    if (cachedGraphId !== null) {
      const cachedGraph = await this.redisService.get(cachedGraphId);
      //cache hit
      if (cachedGraph !== null) {
        return JSON.parse(cachedGraph) as GraphResponseDto;
      }
    }

    //cache miss
    const graph = await this.recordGraphService.getGraph(
      startRecordPublicId,
      userId,
    );

    await this.redisService.cacheGraph(userId, startRecordPublicId, graph);

    return graph;
  }

  async getGraphNeighborDetail(startRecordPublicId: string, userId: bigint) {
    return this.recordGraphService.getGraphNeighborDetail(
      startRecordPublicId,
      userId,
    );
  }

  async findOneById(id: bigint, userId: bigint) {
    const record = await this.prisma.record.findUnique({
      where: { id, userId },
    });

    if (!record) throw new RecordNotFoundException(`ID: ${id.toString()}`);
    return record;
  }

  private async buildRecordListResponse(
    records: (RecordModel | RecordModelWithoutCoords)[],
    totalCount: number,
    onlyFirstImage = false,
  ): Promise<RecordListResponseDto> {
    const recordIds = records.map((r) => r.id);

    const [tagsMap, imagesMap] = await Promise.all([
      this.recordTagsService.getTagsByRecordIds(recordIds),
      this.recordImageService.getImagesByRecordIds({
        recordIds,
        onlyFirst: onlyFirstImage,
      }),
    ]);

    return RecordListResponseDto.of(records, tagsMap, imagesMap, totalCount);
  }

  private getEndOfDay(dateString: string): Date {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date;
  }

  private async createRecordWithImages(
    userId: bigint,
    dto: CreateRecordDto,
    images: Express.Multer.File[],
  ): Promise<RecordResponseDto> {
    const userPublicId = (await this.usersService.findById(userId)).publicId;
    const recordPublicId = nanoid(12);

    const locationInfo = await this.recordLocationService.getLocationInfo(
      dto.location.latitude,
      dto.location.longitude,
    );

    const { uploadedImages, uploadedKeys, processedImages } =
      await this.recordImageService.processAndUploadImages(
        userPublicId,
        recordPublicId,
        images,
      );

    try {
      return await this.executeCreateTransaction(
        userId,
        dto,
        locationInfo,
        recordPublicId,
        processedImages,
        uploadedImages,
      );
    } catch (error) {
      await this.objectStorageService.deleteImages(uploadedKeys);
      throw error;
    }
  }

  private async createRecordWithoutImages(
    userId: bigint,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    const locationInfo = await this.recordLocationService.getLocationInfo(
      dto.location.latitude,
      dto.location.longitude,
    );

    return this.executeCreateTransaction(userId, dto, locationInfo);
  }

  private async executeCreateTransaction(
    userId: bigint,
    dto: CreateRecordDto,
    locationInfo: LocationInfo,
    recordPublicId?: string,
    processedImages?: ProcessedImage[],
    uploadedImages?: UploadedImage[],
  ): Promise<RecordResponseDto> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const created = await tx.record.create({
          data: {
            ...(recordPublicId && { publicId: recordPublicId }),
            userId,
            title: dto.title,
            content: dto.content ?? null,
            locationName: locationInfo.name,
            locationAddress: locationInfo.address,
            isFavorite: false,
          },
        });

        const [updated, tags] = await Promise.all([
          this.recordLocationService.updateRecordLocation(
            tx,
            created.id,
            dto.location.longitude,
            dto.location.latitude,
          ),
          this.recordTagsService.createRecordTags(
            tx,
            userId,
            created.id,
            dto.tags,
          ),
        ]);

        if (processedImages?.length && uploadedImages?.length) {
          await this.recordImageService.saveImages(
            tx,
            updated.id,
            processedImages,
            uploadedImages,
          );
        }

        const tagNames = tags.map((t) => t.name);
        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: updated.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_CREATED,
          payload: createRecordSyncPayload(
            userId,
            updated,
            tagNames,
            uploadedImages?.[0]?.urls?.thumbnail,
          ),
        });

        const imagesMap = await this.recordImageService.getImagesByRecordIds({
          recordIds: [updated.id],
          tx,
        });
        const images = imagesMap.get(updated.id) ?? [];

        return { record: updated, tags, images };
      });

      this.logger.log(
        `Record created: publicId=${result.record.publicId}, userId=${userId}`,
      );

      return RecordResponseDto.of(result.record, result.tags, result.images);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create record: userId=${userId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordCreationFailedException(error);
      }
      throw new Error('Unexpected non-Error exception thrown');
    }
  }
}
