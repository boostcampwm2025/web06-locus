import { Inject, Injectable, Logger } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { ObjectStorageService } from './object-storage.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ProcessedImage, UploadedImage } from './object-storage.types';
import { nanoid } from 'nanoid';
import { Prisma, ImageStatus } from '@prisma/client';
import { ImageModel } from '../records.types';
import { RedisService } from '@/redis/redis.service';
import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';
import {
  IMAGE_UPLOAD_CONFIG,
  ImageUploadConfig,
} from '../config/image-upload.config';

@Injectable()
export class RecordImageService {
  private readonly logger = new Logger(RecordImageService.name);
  constructor(
    private readonly imageProcessingService: ImageProcessingService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(IMAGE_UPLOAD_CONFIG)
    private readonly imageUploadConfig: ImageUploadConfig,
  ) {}

  async processAndUploadImages(
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

  async saveImages(
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

  async getImagesByRecordIds({
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
        status: true,
      },
    });

    return this.groupImagesByRecordId(images);
  }

  async deleteImagesFromStorage(imageUrls: string[]): Promise<void> {
    if (imageUrls.length === 0) return;

    const imageKeys = imageUrls.map((url) =>
      this.objectStorageService.extractKeyFromUrl(url),
    );

    try {
      await this.objectStorageService.deleteImages(imageKeys);
    } catch (error) {
      this.logger.error(
        `[Storage Error] Failed to delete images: ${imageKeys.join(', ')}`,
        error,
      );
    }
  }

  /**
   * Cloud Functions 웹훅: 이미지 리사이징 완료 처리
   * Image 레코드를 찾아서 URLs와 메타데이터를 업데이트하고 status를 COMPLETED로 변경
   */
  async handleResizeComplete(
    imageId: string,
    urls: { original: string; thumbnail: string; medium: string },
    metadata: {
      original: { width: number; height: number; size: number };
      thumbnail: { width: number; height: number; size: number };
      medium: { width: number; height: number; size: number };
    },
  ): Promise<void> {
    try {
      // Image 레코드 찾기 (publicId = imageId)
      const image = await this.prisma.image.findUnique({
        where: { publicId: imageId },
      });

      if (!image) {
        // 웹훅이 먼저 도착한 경우 - Redis에 캐시 저장
        const cacheKey = `${REDIS_KEY_PREFIX.WEBHOOK_PENDING}${imageId}`;
        const cacheValue = JSON.stringify({ urls, metadata });
        const ttl = this.imageUploadConfig.webhook.cacheTtlSec;

        try {
          await this.redis.set(cacheKey, cacheValue, ttl);
          this.logger.warn(
            `Image not found for webhook: imageId=${imageId}. Cached for ${ttl}s.`,
          );
        } catch (redisError) {
          // Redis 실패해도 웹훅 처리는 계속 (로그만 기록)
          this.logger.error(
            `Failed to cache webhook data: imageId=${imageId}`,
            redisError instanceof Error ? redisError.stack : String(redisError),
          );
        }
        return;
      }

      // Image 업데이트 (URLs, metadata, status)
      await this.prisma.image.update({
        where: { publicId: imageId },
        data: {
          originalUrl: urls.original,
          originalWidth: metadata.original.width,
          originalHeight: metadata.original.height,
          originalSize: metadata.original.size,
          thumbnailUrl: urls.thumbnail,
          thumbnailWidth: metadata.thumbnail.width,
          thumbnailHeight: metadata.thumbnail.height,
          thumbnailSize: metadata.thumbnail.size,
          mediumUrl: urls.medium,
          mediumWidth: metadata.medium.width,
          mediumHeight: metadata.medium.height,
          mediumSize: metadata.medium.size,
          status: ImageStatus.COMPLETED,
        },
      });

      this.logger.log(`Image resize completed: imageId=${imageId}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to handle resize complete: imageId=${imageId}, error=${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  /**
   * Image 생성 후 캐시된 웹훅 데이터 확인 및 적용
   *
   * 웹훅이 Image 레코드보다 먼저 도착한 경우,
   * Redis에 캐시된 데이터를 확인하고 즉시 Image를 업데이트합니다.
   *
   * @param imageId - Image publicId
   * @returns 캐시 적용 여부
   */
  async checkPendingWebhook(imageId: string): Promise<boolean> {
    const cacheKey = `${REDIS_KEY_PREFIX.WEBHOOK_PENDING}${imageId}`;

    try {
      const cached = await this.redis.get(cacheKey);

      if (!cached) {
        return false;
      }

      const { urls, metadata } = JSON.parse(cached) as {
        urls: { original: string; thumbnail: string; medium: string };
        metadata: {
          original: { width: number; height: number; size: number };
          thumbnail: { width: number; height: number; size: number };
          medium: { width: number; height: number; size: number };
        };
      };

      // 즉시 COMPLETED 상태로 업데이트
      await this.prisma.image.update({
        where: { publicId: imageId },
        data: {
          originalUrl: urls.original,
          originalWidth: metadata.original.width,
          originalHeight: metadata.original.height,
          originalSize: metadata.original.size,
          thumbnailUrl: urls.thumbnail,
          thumbnailWidth: metadata.thumbnail.width,
          thumbnailHeight: metadata.thumbnail.height,
          thumbnailSize: metadata.thumbnail.size,
          mediumUrl: urls.medium,
          mediumWidth: metadata.medium.width,
          mediumHeight: metadata.medium.height,
          mediumSize: metadata.medium.size,
          status: ImageStatus.COMPLETED,
        },
      });

      // 캐시 삭제
      await this.redis.del(cacheKey);

      this.logger.log(`Applied pending webhook: imageId=${imageId}`);
      return true;
    } catch (error) {
      // Redis 에러나 JSON 파싱 에러는 로그만 기록
      this.logger.error(
        `Failed to check/apply pending webhook: imageId=${imageId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  private groupImagesByRecordId(
    images: ({ recordId: bigint } & ImageModel)[],
  ): Map<bigint, ImageModel[]> {
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
