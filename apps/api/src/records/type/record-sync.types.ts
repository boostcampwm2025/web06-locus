import { OutboxEventType } from '@/common/constants/event-types.constants';
import { RecordModel } from '../records.types';

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
  tags: string[];
  hasImages: boolean;
  thumbnailImage: string | null;
  connectionsCount: number;
  createdAt: string;
}

export const createRecordSyncPayload = (
  userId: bigint,
  record: RecordModel,
  tags: string[] = [],
  thumbnailImageUrl?: string,
): RecordSyncPayload => {
  return {
    recordId: record.id.toString(),
    publicId: record.publicId,
    userId: userId.toString(),
    title: record.title,
    content: record.content,
    isFavorite: record.isFavorite,
    locationName: record.locationName,
    tags,
    hasImages: !!thumbnailImageUrl,
    thumbnailImage: thumbnailImageUrl ?? null,
    connectionsCount: 0,
    createdAt: record.createdAt.toISOString(),
  };
};

export interface RecordFavoriteSyncPayload {
  recordId: string;
  isFavorite: boolean;
}

export const createRecordFavoriteSyncPayload = (
  recordId: bigint,
  isFavorite: boolean,
): RecordFavoriteSyncPayload => {
  return {
    recordId: recordId.toString(),
    isFavorite,
  };
};

export interface RecordConnectionsCountSyncPayload {
  recordId: string;
  connectionsCount: number;
}

export const createRecordConnectionsCountSyncPayload = (
  recordId: bigint,
  connectionsCount: number,
): RecordConnectionsCountSyncPayload => {
  return {
    recordId: recordId.toString(),
    connectionsCount,
  };
};
