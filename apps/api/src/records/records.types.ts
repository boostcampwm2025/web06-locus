export interface RecordModel {
  id: bigint;
  publicId: string;
  title: string;
  content: string | null;
  longitude: number;
  latitude: number;
  locationName: string | null;
  locationAddress: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  connectionsCount: number;
}

export type RecordModelWithoutCoords = Omit<
  RecordModel,
  'longitude' | 'latitude'
>;

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

export interface LocationInfo {
  name: string | null;
  address: string | null;
}
