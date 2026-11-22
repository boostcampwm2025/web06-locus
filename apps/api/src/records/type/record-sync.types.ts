import { OutboxEventType } from '@/common/constants/event-types.constants';

export interface RecordSyncEvent {
  eventId: string;
  eventType: OutboxEventType;
  aggregateId: string;
  payload:
    | RecordSyncPayload
    | RecordFavoriteSyncPayload
    | RecordConnectionsCountSyncPayload;
}

export interface RecordSyncPayload {
  recordId: string;
  publicId: string;
  userId: string;
  title: string;
  content: string | null;
  isFavorite: boolean;
  locationName: string | null;
  locationAddress: string | null;
  tags: string[];
  hasImages: boolean;
  thumbnailImage: string | null;
  connectionsCount: number;
  createdAt: string;
}

export interface RecordFavoriteSyncPayload {
  recordId: string;
  isFavorite: boolean;
}

export interface RecordConnectionsCountSyncPayload {
  recordId: string;
  connectionsCount: number;
}
