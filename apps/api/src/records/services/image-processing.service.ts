import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ImageVariant, ProcessedImageResult } from './object-storage.types';

const THUMBNAIL_WIDTH = 400;
const MEDIUM_WIDTH = 1200;
const JPEG_QUALITY = 80;

@Injectable()
export class ImageProcessingService {
  async process(file: Express.Multer.File): Promise<ProcessedImageResult> {
    const sharpInstance = sharp(file.buffer);
    const metadata = await sharpInstance.metadata();

    const [thumbnail, medium, original] = await Promise.all([
      this.resizeImage(sharpInstance.clone(), metadata, THUMBNAIL_WIDTH),
      this.resizeImage(sharpInstance.clone(), metadata, MEDIUM_WIDTH),
      this.resizeImage(sharpInstance.clone(), metadata),
    ]);

    return { thumbnail, medium, original };
  }

  private async resizeImage(
    image: sharp.Sharp,
    metadata: sharp.Metadata,
    targetWidth?: number,
  ): Promise<ImageVariant> {
    const shouldResize =
      targetWidth !== undefined &&
      metadata.width !== undefined &&
      metadata.width > targetWidth;

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
}
