import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { API_METRICS } from './constants/metrics.constants';

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
