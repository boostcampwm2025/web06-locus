import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import {
  RecordCreationFailedException,
  RecordNotFoundException,
} from './exceptions/record.exceptions';
import { GRAPH_RAWS_SQL } from './sql/graph.raw.sql';
import { GraphRowType } from './type/graph.type';
import { GraphEdgeDto, GraphNodeDto } from './dto/graph.dto';
import { GraphResponseDto } from './dto/graph.response.dto';
import { createRecordSyncPayload } from './type/record-sync.types';
import { Prisma } from '@prisma/client';
import { OutboxService } from '@/outbox/outbox.service';
import {
  AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
} from '@/common/constants/event-types.constants';
import { UPDATE_RECORD_LOCATION_SQL } from './sql/record-raw.query';
import { ImageProcessingService } from './services/image-processing.service';
import { ObjectStorageService } from './services/object-storage.service';
import { ProcessedImage, UploadedImage } from './services/object-storage.types';
import { nanoid } from 'nanoid';
import { UsersService } from '@/users/users.service';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reverseGeocodingService: ReverseGeocodingService,
    private readonly outboxService: OutboxService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly usersService: UsersService,
  ) {}

  async createRecord(
    userId: bigint,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        dto.location.latitude,
        dto.location.longitude,
      );

    if (!name && !address) {
      this.logger.warn(
        `Reverse geocoding failed: lat=${dto.location.latitude}, lng=${dto.location.longitude}`,
      );
    }

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const created = await this.saveRecord(tx, userId, dto, name, address);
        const updated = await this.updateLocation(
          tx,
          created.id,
          dto.location.longitude,
          dto.location.latitude,
        );

        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: updated.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_CREATED,
          payload: createRecordSyncPayload(userId, updated),
        });

        return updated;
      });

      this.logger.log(
        `Record created: publicId=${record.publicId}, userId=${userId}, title="${dto.title}"`,
      );

      return RecordResponseDto.from(record);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create record: userId=${userId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordCreationFailedException(error);
      } else {
        this.logger.error(
          `Non-Error exception thrown during record creation: userId=${userId}, raw=${JSON.stringify(error)}`,
        );
        throw new Error('Unexpected non-Error exception thrown');
      }
    }
  }

  async findOneByPublicId(publicId: string) {
    const record = await this.prisma.record.findUnique({
      where: { publicId },
      select: {
        id: true,
        userId: true,
        publicId: true,
      },
    });

    if (!record) {
      throw new RecordNotFoundException(publicId);
    }

    return record;
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
      const record = await this.executeRecordTransaction(
        userId,
        dto,
        locationInfo,
        recordPublicId,
        processedImages,
        uploadedImages,
      );
      return RecordResponseDto.from(record);
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

    const record = await this.executeRecordTransaction(
      userId,
      dto,
      locationInfo,
    );

    return RecordResponseDto.from(record);
  }

  private async executeRecordTransaction(
    userId: bigint,
    dto: CreateRecordDto,
    locationInfo: { name: string | null; address: string | null },
    recordPublicId?: string,
    processedImages?: ProcessedImage[],
    uploadedImages?: UploadedImage[],
  ): Promise<RecordModel> {
    try {
      const record = await this.prisma.$transaction(async (tx) => {
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

        return updated;
      });

      this.logger.log(
        `Record created: publicId=${record.publicId}, userId=${userId}, title="${dto.title}"`,
      );

      return record;
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

  // TODO: 태그 관련 중간테이블 및 서비스 추가
  // TODO: 이미지 기능 추가

  // NOTE: repository 계층으로 분리..?
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
        tags: dto.tags ?? [],
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
  ): Promise<{ name: string | null; address: string | null }> {
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        latitude,
        longitude,
      );

    if (!name && !address) {
      this.logger.warn(
        `Reverse geocoding failed: lat=${latitude}, lng=${longitude}`,
      );
    }

    return { name, address };
  }

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
}
