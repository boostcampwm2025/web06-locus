import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import {
  IMAGE_SIZES,
  ImageSize,
  ProcessedImage,
  UploadedImage,
} from './object-storage.types';
import { ImageDeletionFailedException } from '../exceptions/record.exceptions';

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('NCP_BUCKET_NAME');
    this.publicUrl = this.configService.getOrThrow<string>('NCP_PUBLIC_URL');

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('NCP_REGION'),
      endpoint: this.configService.getOrThrow<string>('NCP_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('NCP_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('NCP_SECRET_KEY'),
      },
    });
  }

  async uploadImage(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return `${this.publicUrl}/${key}`;
  }

  /**
   * 기록에 포함된 여러 이미지를 Object Storage에 업로드
   * 각 이미지는 thumbnail, medium, original 3가지 사이즈로 업로드됨
   * @param userPublicId - 사용자 공개 ID
   * @param recordPublicId - 기록 공개 ID
   * @param images - 처리된 이미지 배열 (각 이미지당 3가지 사이즈 variant 포함)
   * @returns uploadedImages: 이미지별 URL 정보, uploadedKeys: 롤백용 스토리지 키 목록
   */
  async uploadRecordImages(
    userPublicId: string,
    recordPublicId: string,
    images: ProcessedImage[],
  ): Promise<{ uploadedImages: UploadedImage[]; uploadedKeys: string[] }> {
    const uploadedKeys: string[] = [];

    // 모든 이미지의 모든 사이즈를 병렬로 업로드 (최대 5개 이미지 × 3사이즈 = 15개 동시 요청)
    const allPromises = images.flatMap((image) =>
      IMAGE_SIZES.map(async (size) => {
        const key = this.buildKey(
          userPublicId,
          recordPublicId,
          image.imageId,
          size,
        );
        const url = await this.uploadImage(
          image.variants[size].buffer,
          key,
          'image/jpeg',
        );
        return { imageId: image.imageId, size, key, url };
      }),
    );

    const results = await Promise.all(allPromises);

    results.forEach((r) => uploadedKeys.push(r.key));

    // 업로드 결과를 imageId별로 그룹핑하여 UploadedImage 형태로 변환
    const imageMap = new Map<string, Record<ImageSize, string>>();
    for (const { imageId, size, url } of results) {
      if (!imageMap.has(imageId)) {
        imageMap.set(imageId, {} as Record<ImageSize, string>);
      }
      imageMap.get(imageId)![size] = url;
    }

    const uploadedImages: UploadedImage[] = images.map((image) => ({
      imageId: image.imageId,
      urls: imageMap.get(image.imageId)!,
    }));

    return { uploadedImages, uploadedKeys };
  }

  async deleteImages(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    this.logger.debug(`Attempting to delete images: ${JSON.stringify(keys)}`);

    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    try {
      const response = await this.s3Client.send(command);

      if (response.Deleted?.length) {
        this.logger.log(
          `Successfully deleted ${response.Deleted.length}/${keys.length} images`,
        );
      }

      if (response.Errors?.length) {
        throw new ImageDeletionFailedException(response.Errors);
      }
    } catch (error) {
      if (error instanceof ImageDeletionFailedException) {
        throw error;
      }

      this.logger.error(`Failed to delete images: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  private buildKey(
    userPublicId: string,
    recordPublicId: string,
    imageId: string,
    size: ImageSize,
  ): string {
    return `records/${userPublicId}/${recordPublicId}/${imageId}/${size}.jpg`;
  }

  /**
   * 저장된 URL에서 S3 키를 추출합니다.
   * URL 형식: ${publicUrl}/${key}
   */
  extractKeyFromUrl(url: string): string {
    // publicUrl 부분을 제거하고 키만 추출
    if (url.startsWith(this.publicUrl)) {
      return url.slice(this.publicUrl.length + 1); // publicUrl + '/' 제거
    }
    // fallback: pathname에서 추출 시도
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1);
  }
}
