import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import {
  API_METRICS,
  ELASTICSEARCH_METRICS,
  OUTBOX_METRICS,
  RABBITMQ_METRICS,
} from './constants/metrics.constants';

export const metricsProviders = [
  // HTTP 요청 총 개수
  makeCounterProvider({
    name: API_METRICS.HTTP_REQUESTS_TOTAL,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
  }),

  // HTTP 요청 응답 시간 (히스토그램)
  makeHistogramProvider({
    name: API_METRICS.HTTP_REQUEST_DURATION_SEC,
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  }),
];

export const outboxMetricsProviders = [
  makeCounterProvider({
    name: OUTBOX_METRICS.OUTBOX_EVENTS_PUBLISHED_TOTAL,
    help: 'Total number of outbox events published to RabbitMQ',
    labelNames: ['status', 'event_type'],
  }),

  makeCounterProvider({
    name: OUTBOX_METRICS.STATUS_TRANSITIONS_TOTAL,
    help: 'Total number of outbox status transitions',
    labelNames: ['from_status', 'to_status', 'event_type'],
  }),

  makeHistogramProvider({
    name: OUTBOX_METRICS.OUTBOX_PROCESSING_DURATION_SEC,
    help: 'Duration from outbox event creation to publication',
    labelNames: ['event_type'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  }),

  makeCounterProvider({
    name: OUTBOX_METRICS.OUTBOX_DEAD_LETTER_TOTAL,
    help: 'Total number of events moved to dead letter queue',
    labelNames: ['event_type'],
  }),
];

export const rabbitMQMetricsProviders = [
  makeCounterProvider({
    name: RABBITMQ_METRICS.MESSAGES_PUBLISHED_TOTAL,
    help: 'Total number of messages published',
    labelNames: ['pattern', 'status'],
  }),

  makeCounterProvider({
    name: RABBITMQ_METRICS.MESSAGES_CONSUMED_TOTAL,
    help: 'Total number of messages consumed',
    labelNames: ['pattern', 'status'],
  }),

  makeHistogramProvider({
    name: RABBITMQ_METRICS.MESSAGES_PROCESSING_DURATION_SEC,
    help: 'Duration of message processing',
    labelNames: ['pattern', 'event_type'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  }),

  makeGaugeProvider({
    name: RABBITMQ_METRICS.MESSAGES_IN_FLIGHT,
    help: 'Number of messages currently in flight',
    labelNames: ['pattern'],
  }),
];

export const elasticSearchMetricsProviders = [
  makeCounterProvider({
    name: ELASTICSEARCH_METRICS.OPERATIONS_TOTAL,
    help: 'Total number of Elasticsearch operations',
    labelNames: ['operation', 'status'],
  }),

  makeHistogramProvider({
    name: ELASTICSEARCH_METRICS.OPERATION_DURATION_SEC,
    help: 'Duration of Elasticsearch operations',
    labelNames: ['operation'],
    buckets: [0.01, 0.1, 0.5, 1, 5],
  }),

  makeCounterProvider({
    name: ELASTICSEARCH_METRICS.RECORD_SYNC_EVENTS_TOTAL,
    help: 'Total number of record sync events processed',
    labelNames: ['event_type'],
  }),
];

export const allMetricsProviders = [
  ...metricsProviders,
  ...outboxMetricsProviders,
  ...rabbitMQMetricsProviders,
  ...elasticSearchMetricsProviders,
];
