export type ImageSize = 'thumbnail' | 'medium' | 'original';

export interface ImageVariant {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

// ImageProcessingService가 반환하는 타입
export interface ProcessedImageResult {
  thumbnail: ImageVariant;
  medium: ImageVariant;
  original: ImageVariant;
}

// ObjectStorageService가 받는 타입 (RecordsService에서 imageId 할당)
export interface ProcessedImage {
  imageId: string;
  variants: {
    thumbnail: ImageVariant;
    medium: ImageVariant;
    original: ImageVariant;
  };
}

// ObjectStorageService가 반환하는 타입
export interface UploadedImage {
  imageId: string;
  urls: {
    thumbnail: string;
    medium: string;
    original: string;
  };
}
