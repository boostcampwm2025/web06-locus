import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MapsService } from '../maps/maps.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto, RecordTagDto } from './dto/record-response.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';
import { ImageModel, LocationInfo, RecordModel } from './records.types';
import {
  LocationNotFoundException,
  ImageDeletionFailedException,
  InvalidBoundsException,
  RecordAccessDeniedException,
  RecordCreationFailedException,
  RecordDeletionFailedException,
  RecordNotFoundException,
} from './exceptions/record.exceptions';
import { GRAPH_NEIGHBOR_RAWS_SQL, GRAPH_RAWS_SQL } from './sql/graph.raw.sql';
import { GraphRowType } from './type/graph.type';
import { GraphEdgeDto, GraphNodeDto } from './dto/graph.dto';
import { GraphResponseDto } from './dto/graph.response.dto';
import { createRecordSyncPayload } from './type/record-sync.types';
import { Prisma, Record } from '@prisma/client';
import { OutboxService } from '@/outbox/outbox.service';
import {
  AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
} from '@/common/constants/event-types.constants';
import {
  COUNT_RECORDS_IN_BOUNDS_SQL,
  SELECT_RECORDS_IN_BOUNDS_SQL,
  UPDATE_RECORD_LOCATION_SQL,
  GET_RECORD_LOCATION_SQL,
  SELECT_RECORDS_BY_LOCATION_SQL,
  COUNT_RECORDS_BY_LOCATION_SQL,
} from './sql/record-raw.query';
import { GetAllRecordsDto } from './dto/get-all-records.dto';
import { GetRecordsByLocationDto } from './dto/get-records-by-location.dto';
import { ImageProcessingService } from './services/image-processing.service';
import { ObjectStorageService } from './services/object-storage.service';
import {
  ImageUrls,
  ProcessedImage,
  UploadedImage,
} from './services/object-storage.types';
import { nanoid } from 'nanoid';
import { UsersService } from '@/users/users.service';
import { RecordListResponseDto } from './dto/records-list-reponse.dto';
import { RecordSearchService } from './records-search.service';
import { SearchRecordsDto } from './dto/search-records.dto';
import { SearchRecordListResponseDto } from './dto/search-record-list-response.dto';
import { RecordTagsService } from './record-tags.service';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordRowType } from './type/record.type';
import { TagsService } from '@/tags/tags.services';
import { GraphRecordDto } from './dto/graph-details.response.dto';
import { ImagesService } from '@/images/images.service';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reverseGeocodingService: MapsService,
    private readonly outboxService: OutboxService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly usersService: UsersService,
    private readonly recordSearchService: RecordSearchService,
    private readonly recordTagsService: RecordTagsService,
    private readonly tagsService: TagsService,
    private readonly imagesService: ImagesService,
  ) {}

  /**
   * 기록을 생성합니다.
   * @param userId - 사용자 ID
   * @param dto - 기록 생성 데이터
   * @param images - 첨부 이미지 (선택, 최대 5개)
   */
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

  // NOTE: 업데이트 로직 대충 작성 (todo: 휴고의 로직으로 변경)
  async updateRecord(
    userId: bigint,
    publicId: string,
    dto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    const { record, images } = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.record.findFirst({ where: { publicId } });

      if (!existing) throw new RecordNotFoundException(publicId);
      if (existing.userId !== userId)
        throw new RecordAccessDeniedException(publicId);

      let locationName = existing.locationName;
      let locationAddress = existing.locationAddress;

      if (dto.location) {
        const { name, address } = await this.getLocationInfo(
          dto.location.latitude,
          dto.location.longitude,
        );
        locationName = name;
        locationAddress = address;
      }

      const updated = await tx.record.update({
        where: { id: existing.id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.content !== undefined && { content: dto.content }),
          //...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.location && { locationName, locationAddress }),
        },
      });

      const updatedRecord = dto.location
        ? await this.updateLocation(
            tx,
            updated.id,
            dto.location.latitude,
            dto.location.longitude,
          )
        : await this.getRecordWithLocation(tx, existing.id, updated);

      await this.outboxService.publish(tx, {
        aggregateType: AGGREGATE_TYPE.RECORD,
        aggregateId: updatedRecord.id.toString(),
        eventType: OUTBOX_EVENT_TYPE.RECORD_UPDATED,
        payload: createRecordSyncPayload(userId, updatedRecord),
      });

      const imagesMap = await this.fetchImagesByRecordIds({
        recordIds: [updatedRecord.id],
        tx,
      });
      const images = imagesMap.get(updatedRecord.id) ?? [];

      return { record: updatedRecord, images };
    });

    const tags = await this.recordTagsService.getRecordTags(record.id);
    return RecordResponseDto.of(record, tags, images);
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

  async findOneByPublicId(publicId: string) {
    const record = await this.prisma.record.findUnique({
      where: { publicId },
      select: { id: true, userId: true, publicId: true },
    });

    if (!record) {
      throw new RecordNotFoundException(publicId);
    }

    return record;
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

    const [records, countResult] = await Promise.all([
      this.prisma.$queryRaw<RecordModel[]>(
        SELECT_RECORDS_IN_BOUNDS_SQL(
          userId,
          dto.swLng,
          dto.swLat,
          dto.neLng,
          dto.neLat,
          dto.sortOrder,
          dto.limit,
          offset,
        ),
      ),
      this.prisma.$queryRaw<[{ count: number }]>(
        COUNT_RECORDS_IN_BOUNDS_SQL(
          userId,
          dto.swLng,
          dto.swLat,
          dto.neLng,
          dto.neLat,
        ),
      ),
    ]);

    const recordIds = records.map((r) => r.id);
    const [tagsMap, imagesMap] = await Promise.all([
      this.recordTagsService.fetchTagsByRecordIds(recordIds),
      this.fetchImagesByRecordIds({ recordIds }),
    ]);

    return RecordListResponseDto.of(
      records,
      tagsMap,
      imagesMap,
      countResult[0].count,
    );
  }

  async getRecordsByLocation(
    userId: bigint,
    dto: GetRecordsByLocationDto,
  ): Promise<RecordListResponseDto> {
    const offset = (dto.page - 1) * dto.limit;

    const [records, countResult] = await Promise.all([
      this.prisma.$queryRaw<RecordModel[]>(
        SELECT_RECORDS_BY_LOCATION_SQL(
          userId,
          dto.latitude,
          dto.longitude,
          dto.radius,
          dto.sortOrder,
          dto.limit,
          offset,
        ),
      ),
      this.prisma.$queryRaw<[{ count: number }]>(
        COUNT_RECORDS_BY_LOCATION_SQL(
          userId,
          dto.latitude,
          dto.longitude,
          dto.radius,
        ),
      ),
    ]);

    const recordIds = records.map((r) => r.id);
    const [tagsMap, imagesMap] = await Promise.all([
      this.recordTagsService.fetchTagsByRecordIds(recordIds),
      this.fetchImagesByRecordIds({ recordIds }),
    ]);

    return RecordListResponseDto.of(
      records,
      tagsMap,
      imagesMap,
      countResult[0].count,
    );
  }

  async getAllRecords(
    userId: bigint,
    dto: GetAllRecordsDto,
  ): Promise<RecordListResponseDto> {
    const offset = (dto.page - 1) * dto.limit;

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? this.getEndOfDay(dto.endDate) : undefined;

    const tagIds = await this.convertTagPublicIdsToIds(
      userId,
      dto.tagPublicIds,
    );

    const where: Prisma.RecordWhereInput = {
      userId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && {
        createdAt: { ...(startDate && { gte: startDate }), lt: endDate },
      }),
      ...(tagIds?.length && {
        tags: { some: { tagId: { in: tagIds } } },
      }),
    };

    const [records, totalCount] = await Promise.all([
      this.prisma.record.findMany({
        where,
        select: {
          id: true,
          publicId: true,
          title: true,
          content: true,
          locationName: true,
          locationAddress: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: dto.sortOrder },
        skip: offset,
        take: dto.limit,
      }),
      this.prisma.record.count({ where }),
    ]);

    const recordIds = records.map((r) => r.id);
    const [tagsMap, imagesMap] = await Promise.all([
      this.recordTagsService.fetchTagsByRecordIds(recordIds),
      this.fetchImagesByRecordIds({ recordIds, onlyFirst: true }),
    ]);

    return RecordListResponseDto.of(records, tagsMap, imagesMap, totalCount);
  }

  private getEndOfDay(dateString: string): Date {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date;
  }

  private async convertTagPublicIdsToIds(
    userId: bigint,
    tagPublicIds?: string[],
  ): Promise<bigint[] | undefined> {
    if (!tagPublicIds || tagPublicIds.length === 0) {
      return undefined;
    }

    const tags = await this.prisma.tag.findMany({
      where: {
        userId,
        publicId: { in: tagPublicIds },
      },
      select: { id: true, publicId: true },
    });

    if (tags.length !== tagPublicIds.length) {
      const foundPublicIds = new Set(tags.map((tag) => tag.publicId));
      const notFoundIds = tagPublicIds.filter((id) => !foundPublicIds.has(id));
      this.logger.warn(
        `Tag not found for filtering: userId=${userId}, notFoundTagPublicIds=[${notFoundIds.join(', ')}]`,
      );
    }

    return tags.map((tag) => tag.id);
  }

  async getRecordDetail(
    userId: bigint,
    publicId: string,
  ): Promise<RecordResponseDto> {
    const record = await this.prisma.record.findFirst({ where: { publicId } });

    if (!record) {
      throw new RecordNotFoundException(publicId);
    }

    if (record.userId !== userId) {
      throw new RecordAccessDeniedException(publicId);
    }

    const recordWithLocation = await this.getRecordWithLocation(
      this.prisma,
      record.id,
      record,
    );

    const [tags, imagesMap] = await Promise.all([
      this.recordTagsService.getRecordTags(record.id),
      this.fetchImagesByRecordIds({ recordIds: [record.id] }),
    ]);
    const images = imagesMap.get(record.id) ?? [];

    return RecordResponseDto.of(recordWithLocation, tags, images);
  }

  async getGraph(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphResponseDto> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    // 그래프 탐색 쿼리 실행
    const rows = await this.prisma.$queryRaw<GraphRowType[]>(
      GRAPH_RAWS_SQL(startRecordId, BigInt(userId)),
    );

    const { nodes, edges } = this.buildGraphFromRows(rows);

    return {
      nodes,
      edges,
      meta: {
        start: startRecordPublicId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        truncated: false,
      },
    };
  }

  async getGraphNeighborDetail(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphRecordDto[]> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    const records = await this.prisma.$queryRaw<RecordRowType[]>(
      GRAPH_NEIGHBOR_RAWS_SQL(startRecordId),
    );

    if (records.length === 0) return [];

    const recordIds = records.map((r) => r.id);

    const tags = await this.tagsService.findManyByRecordIds(userId, recordIds);

    const tagsByRecordId = this.buildTagsByRecordId(tags);

    return records.map((record) =>
      GraphRecordDto.Of(record, tagsByRecordId.get(record.id) ?? []),
    );
  }

  async getRecordIdByPublicId(publicId: string): Promise<bigint> {
    const recordId = await this.prisma.record.findUnique({
      where: { publicId },
      select: {
        id: true,
      },
    });

    if (!recordId) {
      throw new RecordNotFoundException(publicId);
    }

    return recordId.id;
  }

  private buildTagsByRecordId(
    tags: { recordId: bigint; tagPublicId: string; tagName: string }[],
  ): Map<bigint, { tagPublicId: string; tagName: string }[]> {
    const tagsByRecordId = new Map<
      bigint,
      { tagPublicId: string; tagName: string }[]
    >();
    for (const t of tags) {
      const arr = tagsByRecordId.get(t.recordId);
      if (arr) arr.push({ tagPublicId: t.tagPublicId, tagName: t.tagName });
      else
        tagsByRecordId.set(t.recordId, [
          { tagPublicId: t.tagPublicId, tagName: t.tagName },
        ]);
    }
    return tagsByRecordId;
  }

  async deleteRecord(userId: bigint, publicId: string): Promise<void> {
    // 1. Record 조회 (이미지 포함)
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

    // 2. 존재 여부 확인
    if (!record) {
      throw new RecordNotFoundException(publicId);
    }

    // 3. 소유권 검증
    if (record.userId !== userId) {
      throw new RecordAccessDeniedException(publicId);
    }

    // 4. 이미지 URL에서 스토리지 키 추출
    const imageUrls: ImageUrls[] = record.images.map((img) => ({
      thumbnail: img.thumbnailUrl,
      medium: img.mediumUrl,
      original: img.originalUrl,
    }));
    const imageKeys = this.extractImageKeys(imageUrls);

    // 5. 트랜잭션: DB 삭제 + Outbox 발행
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
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete record: publicId=${publicId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordDeletionFailedException(error);
      }
      throw new Error(
        'Unexpected non-Error exception thrown when delete Record',
      );
    }
    // 6. Object Storage 이미지 삭제 (트랜잭션 성공 후)
    if (imageKeys.length > 0) {
      try {
        await this.objectStorageService.deleteImages(imageKeys);
      } catch (error) {
        if (error instanceof ImageDeletionFailedException) {
          this.logger.error(
            `Failed to delete images in object storage for record ${publicId}: ${error.message}`,
          );
          // TODO: Object Stoage에서 삭제 실패 시 처리 로직 추가
        } else {
          throw error;
        }
      }
    }

    this.logger.log(`Record deleted: publicId=${publicId}, userId=${userId}`);
  }

  private buildGraphFromRows(rows: GraphRowType[]): {
    nodes: GraphNodeDto[];
    edges: GraphEdgeDto[];
  } {
    const nodes: GraphNodeDto[] = [];

    const edges: GraphEdgeDto[] = [];

    for (const row of rows) {
      if (row.row_type === 'node') {
        nodes.push({
          publicId: row.node_public_id,
          location: { latitude: row.latitude, longitude: row.longitude },
        });
      } else {
        // edge
        edges.push({
          fromRecordPublicId: row.from_public_id,
          toRecordPublicId: row.to_public_id,
        });
      }
    }

    return { nodes, edges };
  }

  private async createRecordWithImages(
    userId: bigint,
    dto: CreateRecordDto,
    images: Express.Multer.File[],
  ): Promise<RecordResponseDto> {
    const userPublicId = (await this.usersService.findById(userId)).publicId;
    const recordPublicId = nanoid(12);
    const locationInfo = await this.getLocationInfo(
      dto.location.latitude,
      dto.location.longitude,
    );

    const { uploadedImages, uploadedKeys, processedImages } =
      await this.processAndUploadImages(userPublicId, recordPublicId, images);

    try {
      const { record, tags, images } = await this.executeRecordTransaction(
        userId,
        dto,
        locationInfo,
        recordPublicId,
        processedImages,
        uploadedImages,
      );
      return RecordResponseDto.of(record, tags, images);
    } catch (error) {
      await this.objectStorageService.deleteImages(uploadedKeys);
      throw error;
    }
  }

  private async createRecordWithoutImages(
    userId: bigint,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    const locationInfo = await this.getLocationInfo(
      dto.location.latitude,
      dto.location.longitude,
    );

    const { record, tags, images } = await this.executeRecordTransaction(
      userId,
      dto,
      locationInfo,
    );

    return RecordResponseDto.of(record, tags, images);
  }

  /**
   * Record와 Image를 DB에 저장하는 트랜잭션을 실행합니다.
   * @param recordPublicId - 이미지가 있는 경우 미리 생성된 ID, 없으면 자동 생성
   * @param processedImages - 이미지가 있는 경우에만 전달
   * @param uploadedImages - 이미지가 있는 경우에만 전달
   */
  private async executeRecordTransaction(
    userId: bigint,
    dto: CreateRecordDto,
    locationInfo: LocationInfo,
    recordPublicId?: string,
    processedImages?: ProcessedImage[],
    uploadedImages?: UploadedImage[],
  ): Promise<{
    record: RecordModel;
    tags: RecordTagDto[];
    images: ImageModel[];
  }> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const created = await this.saveRecord(
          tx,
          userId,
          dto,
          locationInfo.name,
          locationInfo.address,
          recordPublicId,
        );

        const updated = await this.updateLocation(
          tx,
          created.id,
          dto.location.longitude,
          dto.location.latitude,
        );

        const tags = await this.recordTagsService.createRecordTags(
          tx,
          userId,
          updated.id,
          dto.tags,
        );

        if (processedImages?.length && uploadedImages?.length) {
          await this.saveImages(
            tx,
            updated.id,
            processedImages,
            uploadedImages,
          );
        }

        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: updated.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_CREATED,
          payload: createRecordSyncPayload(userId, updated),
        });

        const imagesMap = await this.fetchImagesByRecordIds({
          recordIds: [updated.id],
          tx,
        });
        const images = imagesMap.get(updated.id) ?? [];

        return { record: updated, tags, images };
      });

      this.logger.log(
        `Record created: publicId=${result.record.publicId}, userId=${userId}, title="${dto.title}"`,
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create record: userId=${userId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordCreationFailedException(error);
      }
      this.logger.error(
        `Non-Error exception thrown: userId=${userId}, raw=${JSON.stringify(error)}`,
      );
      throw new Error('Unexpected non-Error exception thrown');
    }
  }

  private async saveRecord(
    tx: Prisma.TransactionClient,
    userId: bigint,
    dto: CreateRecordDto,
    locationName: string | null,
    address: string | null,
    publicId?: string,
  ) {
    return tx.record.create({
      data: {
        ...(publicId && { publicId }),
        userId,
        title: dto.title,
        content: dto.content ?? null,
        locationName,
        locationAddress: address,
        isFavorite: false,
      },
    });
  }

  private async updateLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    longitude: number,
    latitude: number,
  ): Promise<RecordModel> {
    const [updated] = await tx.$queryRaw<RecordModel[]>(
      UPDATE_RECORD_LOCATION_SQL(recordId, longitude, latitude),
    );
    return updated;
  }

  private async getLocationInfo(
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo> {
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        latitude,
        longitude,
      );
    return { name, address };
  }

  private async getRecordWithLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    updatedRecord: Record,
  ): Promise<RecordModel> {
    const locations = await tx.$queryRaw<
      { longitude: number; latitude: number }[]
    >(GET_RECORD_LOCATION_SQL(recordId));

    const locationData = locations[0];
    if (!locationData) {
      throw new LocationNotFoundException(updatedRecord.publicId);
    }
    const { userId: _, ...rest } = updatedRecord;

    return {
      ...rest,
      longitude: locationData.longitude,
      latitude: locationData.latitude,
    } as RecordModel;
  }

  /**
   * 이미지를 처리(리사이징)하고 스토리지에 업로드합니다.
   * @returns uploadedImages - DB 저장용 URL 정보
   * @returns uploadedKeys - 롤백용 스토리지 키 목록
   * @returns processedImages - DB 저장용 메타데이터
   */
  private async processAndUploadImages(
    userPublicId: string,
    recordPublicId: string,
    images: Express.Multer.File[],
  ): Promise<{
    uploadedImages: UploadedImage[];
    uploadedKeys: string[];
    processedImages: ProcessedImage[];
  }> {
    const processedImages: ProcessedImage[] = await Promise.all(
      images.map(async (file) => {
        const imageId = nanoid(12);
        const result = await this.imageProcessingService.process(file);
        return { imageId, variants: result };
      }),
    );

    const { uploadedImages, uploadedKeys } =
      await this.objectStorageService.uploadRecordImages(
        userPublicId,
        recordPublicId,
        processedImages,
      );

    return { uploadedImages, uploadedKeys, processedImages };
  }

  private async saveImages(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    processedImages: ProcessedImage[],
    uploadedImages: UploadedImage[],
  ): Promise<void> {
    const imageData = processedImages.map((processed, index) => {
      const uploaded = uploadedImages[index];
      return {
        publicId: processed.imageId,
        recordId,
        order: index,
        thumbnailUrl: uploaded.urls.thumbnail,
        thumbnailWidth: processed.variants.thumbnail.width,
        thumbnailHeight: processed.variants.thumbnail.height,
        thumbnailSize: processed.variants.thumbnail.size,
        mediumUrl: uploaded.urls.medium,
        mediumWidth: processed.variants.medium.width,
        mediumHeight: processed.variants.medium.height,
        mediumSize: processed.variants.medium.size,
        originalUrl: uploaded.urls.original,
        originalWidth: processed.variants.original.width,
        originalHeight: processed.variants.original.height,
        originalSize: processed.variants.original.size,
      };
    });

    await tx.image.createMany({ data: imageData });
  }

  private extractImageKeys(images: ImageUrls[]): string[] {
    return images.flatMap((img) => [
      this.objectStorageService.extractKeyFromUrl(img.thumbnail),
      this.objectStorageService.extractKeyFromUrl(img.medium),
      this.objectStorageService.extractKeyFromUrl(img.original),
    ]);
  }

  private async fetchImagesByRecordIds({
    recordIds,
    tx,
    onlyFirst = false,
  }: {
    recordIds: bigint[];
    tx?: Prisma.TransactionClient;
    onlyFirst?: boolean;
  }): Promise<Map<bigint, ImageModel[]>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const prismaClient = tx ?? this.prisma;

    const images = await prismaClient.image.findMany({
      where: {
        recordId: { in: recordIds },
        ...(onlyFirst && { order: 0 }),
      },
      orderBy: { order: 'asc' },
      select: {
        recordId: true,
        publicId: true,
        order: true,
        thumbnailUrl: true,
        thumbnailWidth: true,
        thumbnailHeight: true,
        thumbnailSize: true,
        mediumUrl: true,
        mediumWidth: true,
        mediumHeight: true,
        mediumSize: true,
        originalUrl: true,
        originalWidth: true,
        originalHeight: true,
        originalSize: true,
      },
    });

    const map = new Map<bigint, ImageModel[]>();
    for (const img of images) {
      const { recordId, ...imageData } = img;
      const arr = map.get(recordId);
      if (arr) arr.push(imageData);
      else map.set(recordId, [imageData]);
    }

    return map;
  }
}
