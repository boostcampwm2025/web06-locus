export interface RecordModel {
  id: number;
  public_id: string;
  user_public_id: string;
  title: string;
  content: string | null;
  longitude: number;
  latitude: number;
  location_name: string;
  location_address: string;
  tags: string[];
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}
