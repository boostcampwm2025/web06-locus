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
