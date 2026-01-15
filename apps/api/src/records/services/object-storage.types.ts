export type ImageSize = 'thumbnail' | 'medium' | 'original';

export interface ProcessedImage {
  imageId: string;
  buffers: {
    thumbnail: Buffer;
    medium: Buffer;
    original: Buffer;
  };
}

export interface UploadedImage {
  imageId: string;
  urls: {
    thumbnail: string;
    medium: string;
    original: string;
  };
}
