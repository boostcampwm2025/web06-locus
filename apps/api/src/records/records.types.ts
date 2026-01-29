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
}

export type RecordModelWithoutCoords = Omit<
  RecordModel,
  'longitude' | 'latitude'
>;

export interface LocationInfo {
  name: string | null;
  address: string | null;
}
