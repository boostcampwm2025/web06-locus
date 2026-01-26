export interface RecordRowType {
  id: bigint;
  publicId: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  locationAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}
