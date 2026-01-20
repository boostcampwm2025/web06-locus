export interface RecordModel {
  id: bigint;
  publicId: string;
  title: string;
  content: string | null;
  longitude: number;
  latitude: number;
  locationName: string;
  locationAddress: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageModel {
  publicId: string;
  order: number;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  thumbnailSize: number;
  mediumUrl: string;
  mediumWidth: number;
  mediumHeight: number;
  mediumSize: number;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
}

export interface RecordWithImages extends RecordModel {
  images: ImageModel[];
}

export interface LocationInfo {
  name: string | null;
  address: string | null;
}
