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
  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  thumbnailSize: number | null;
  mediumUrl: string | null;
  mediumWidth: number | null;
  mediumHeight: number | null;
  mediumSize: number | null;
  originalUrl: string;
  originalWidth: number | null;
  originalHeight: number | null;
  originalSize: number | null;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface LocationInfo {
  name: string | null;
  address: string | null;
}
