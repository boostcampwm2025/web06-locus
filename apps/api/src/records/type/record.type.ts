export interface RecordRowType {
  id: bigint;
  publicId: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  locationAddress: string | null;
  thumbnailPublicId: string | null;
  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  thumbnailSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}
