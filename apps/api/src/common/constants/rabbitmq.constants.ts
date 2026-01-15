export const RABBITMQ_CONSTANTS = {
  QUEUES: {
    RECORD_SYNC: 'record.sync.queue',
  },
  PATTERNS: {
    RECORD_SYNC: 'record.sync',
  },
  CLIENTS: {
    RECORD_SYNC_PRODUCER: 'RECORD_SYNC_PRODUCER',
  },
} as const;
