import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ImageVariant, ProcessedImageResult } from './object-storage.types';

const THUMBNAIL_WIDTH = 400;
const MEDIUM_WIDTH = 1200;
const JPEG_QUALITY = 80;

@Injectable()
export class ImageProcessingService {
  async process(file: Express.Multer.File): Promise<ProcessedImageResult> {
    const [thumbnail, medium, original] = await Promise.all([
      this.resizeImage(file.buffer, THUMBNAIL_WIDTH),
      this.resizeImage(file.buffer, MEDIUM_WIDTH),
      this.optimizeOriginal(file.buffer),
    ]);

    return { thumbnail, medium, original };
  }

  private async resizeImage(
    buffer: Buffer,
    targetWidth: number,
  ): Promise<ImageVariant> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const shouldResize =
      metadata.width !== undefined && metadata.width > targetWidth;

    const processed = shouldResize
      ? image.resize(targetWidth, null, { withoutEnlargement: true })
      : image;

    const outputBuffer = await processed
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    const outputMetadata = await sharp(outputBuffer).metadata();

    return {
      buffer: outputBuffer,
      width: outputMetadata.width ?? 0,
      height: outputMetadata.height ?? 0,
      size: outputBuffer.length,
    };
  }

  private async optimizeOriginal(buffer: Buffer): Promise<ImageVariant> {
    const outputBuffer = await sharp(buffer)
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    const metadata = await sharp(outputBuffer).metadata();

    return {
      buffer: outputBuffer,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      size: outputBuffer.length,
    };
  }
}
