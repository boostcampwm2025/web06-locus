import { OutboxEventType } from '@/common/constants/event-types.constants';

export interface RecordSyncEvent {
  eventId: string;
  eventType: OutboxEventType;
  aggregateId: string;
  payload: RecordSyncPayload;
}

export interface RecordSyncPayload {
  recordId: string;
  publicId: string;
  userId: string;
  title: string;
  content: string;
  isFavorite: boolean;
  locationName?: string;
  tags: string[];
  hasImages: boolean;
  thumbnailImage?: string;
  connectionsCount: number;
  date: string;
  createdAt: string;
}
