export const IMAGE_SIZE = {
  THUMBNAIL: 'thumbnail',
  MEDIUM: 'medium',
  ORIGINAL: 'original',
} as const;

// 타입 추출: 'thumbnail' | 'medium' | 'original'
export type ImageSize = (typeof IMAGE_SIZE)[keyof typeof IMAGE_SIZE];

// 이터러블 배열 추출: ['thumbnail', 'medium', 'original']
export const IMAGE_SIZES = Object.values(IMAGE_SIZE);

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
