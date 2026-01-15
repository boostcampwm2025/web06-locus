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

  async uploadRecordImages(
    userPublicId: string,
    recordPublicId: string,
    images: ProcessedImage[],
  ): Promise<{ uploadedImages: UploadedImage[]; uploadedKeys: string[] }> {
    const uploadedImages: UploadedImage[] = [];
    const uploadedKeys: string[] = [];

    for (const image of images) {
      const uploadPromises = IMAGE_SIZES.map((size) => {
        const key = this.buildKey(
          userPublicId,
          recordPublicId,
          image.imageId,
          size,
        );
        uploadedKeys.push(key);
        return this.uploadImage(image.variants[size].buffer, key, 'image/jpeg');
      });

      const urls = await Promise.all(uploadPromises);

      uploadedImages.push({
        imageId: image.imageId,
        urls: {
          thumbnail: urls[0],
          medium: urls[1],
          original: urls[2],
        },
      });
    }

    return { uploadedImages, uploadedKeys };
  }

  async deleteImages(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Deleted ${keys.length} images from storage`);
    } catch (error) {
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
}
