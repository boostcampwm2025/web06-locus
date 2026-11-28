import { OutboxEventType } from '@/common/constants/event-types.constants';

export interface RecordSyncEvent {
  eventId: string;
  eventType: OutboxEventType;
  aggregateId: string;
  // 삭제 이벤트는 최소 payload, 그 외에는 항상 완전한 스냅샷
  payload: RecordSyncPayload | RecordDeletedPayload;
}

export interface RecordDeletedPayload {
  publicId: string;
  userId: string;
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
