import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { LocationInfo, RecordModel } from './records.types';
import {
  ImageDeletionFailedException,
  RecordAccessDeniedException,
  RecordCreationFailedException,
  RecordDeletionFailedException,
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
import {
  ImageUrls,
  ProcessedImage,
  UploadedImage,
} from './services/object-storage.types';
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
        // TODO: 태그 기능 구현 후 활성화
        // tags: dto.tags ?? [],
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

    if (!name && !address) {
      this.logger.warn(
        `Reverse geocoding failed: lat=${latitude}, lng=${longitude}`,
      );
    }

    return { name, address };
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

  private extractImageKeys(images: ImageUrls[]): string[] {
    return images.flatMap((img) => [
      this.objectStorageService.extractKeyFromUrl(img.thumbnail),
      this.objectStorageService.extractKeyFromUrl(img.medium),
      this.objectStorageService.extractKeyFromUrl(img.original),
    ]);
  }
}
