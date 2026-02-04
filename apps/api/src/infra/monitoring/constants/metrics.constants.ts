export const API_METRICS = {
  HTTP_REQUESTS_TOTAL: 'http_requests_total',
  HTTP_REQUEST_DURATION_SEC: 'http_request_duration_seconds',
};

export const OUTBOX_METRICS = {
  OUTBOX_EVENTS_PUBLISHED_TOTAL: 'outbox_events_published_total',
  STATUS_TRANSITIONS_TOTAL: 'outbox_status_transitions_total',
  OUTBOX_PROCESSING_DURATION_SEC: 'outbox_processing_duration_seconds',
  OUTBOX_DEAD_LETTER_TOTAL: 'outbox_dead_letter_total',
};

export const RABBITMQ_METRICS = {
  MESSAGES_PUBLISHED_TOTAL: 'messages_published_total',
  MESSAGES_CONSUMED_TOTAL: 'messages_consumed_total',
  MESSAGES_PROCESSING_DURATION_SEC: 'message_processing_duration_seconds',
  MESSAGES_IN_FLIGHT: 'messages_in_flight',
};

export const ELASTICSEARCH_METRICS = {
  OPERATIONS_TOTAL: 'elasticsearch_operations_total',
  OPERATION_DURATION_SEC: 'elasticsearch_operation_duration_seconds',
  RECORD_SYNC_EVENTS_TOTAL: 'record_sync_events_total',
};
