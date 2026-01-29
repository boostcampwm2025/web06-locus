import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImageModel } from './images.types';
import { ProcessedImage, UploadedImage } from './object-storage.types';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByRecordIds(recordIds: bigint[]) {
    return await this.prisma.image.findMany({
      where: { recordId: { in: recordIds } },
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

  /**
   * 업로드된 이미지들의 메타데이터를 DB에 저장합니다.
   *
   * @param tx - Prisma 트랜잭션 클라이언트 (트랜잭션 내에서 실행 필수)
   * @param recordId - 이미지가 속할 기록 ID
   * @param processedImages - 리사이징된 이미지의 메타데이터 (크기, 용량 등)
   * @param uploadedImages - 스토리지에 업로드된 이미지의 URL 정보
   *
   * @remarks
   * - processedImages와 uploadedImages의 순서는 반드시 일치해야 합니다.
   * - 배열의 인덱스가 이미지의 order 값으로 사용됩니다.
   * - 트랜잭션 내에서만 실행되므로, 트랜잭션 실패 시 자동 롤백됩니다.
   */
  async saveUploadedImages(
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
