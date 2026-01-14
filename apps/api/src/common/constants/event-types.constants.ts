export const OUTBOX_EVENT_TYPE = {
  RECORD_CREATED: 'RECORD_CREATED',
  RECORD_UPDATED: 'RECORD_UPDATED',
  RECORD_DELETED: 'RECORD_DELETED',
} as const;

export type OutboxEventType =
  (typeof OUTBOX_EVENT_TYPE)[keyof typeof OUTBOX_EVENT_TYPE];

export const AGGREGATE_TYPE = {
  RECORD: 'Record',
  // NOTE: 나중에 추가 가능
} as const;

export type AggregateType =
  (typeof AGGREGATE_TYPE)[keyof typeof AGGREGATE_TYPE];

export interface OutboxEvent<T = any> {
  eventId?: string;
  eventType: OutboxEventType;
  aggregateId: string;
  aggregateType: AggregateType;
  payload: T;
  timestamp?: string;
}
