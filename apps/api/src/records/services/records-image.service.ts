import { Injectable, Logger } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { ObjectStorageService } from './object-storage.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ProcessedImage, UploadedImage } from './object-storage.types';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { ImageModel } from '../records.types';

@Injectable()
export class RecordImageService {
  private readonly logger = new Logger(RecordImageService.name);
  constructor(
    private readonly imageProcessingService: ImageProcessingService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly prisma: PrismaService,
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
