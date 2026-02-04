import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { ELASTICSEARCH_METRICS } from '../constants/metrics.constants';

export type ESOperation = 'index' | 'update' | 'delete';

@Injectable()
export class ElasticsearchMetricsService {
  constructor(
    @InjectMetric(ELASTICSEARCH_METRICS.OPERATIONS_TOTAL)
    private readonly operationsCounter: Counter<string>,

    @InjectMetric(ELASTICSEARCH_METRICS.OPERATION_DURATION_SEC)
    private readonly operationDuration: Histogram<string>,

    @InjectMetric(ELASTICSEARCH_METRICS.RECORD_SYNC_EVENTS_TOTAL)
    private readonly syncEventsCounter: Counter<string>,
  ) {}

  recordOperationSuccess(operation: ESOperation): void {
    this.operationsCounter.inc({ operation, status: 'success' });
  }

  recordOperationFailure(operation: ESOperation): void {
    this.operationsCounter.inc({ operation, status: 'failed' });
  }

  recordOperationDuration(
    operation: ESOperation,
    durationSeconds: number,
  ): void {
    this.operationDuration.observe({ operation }, durationSeconds);
  }

  recordSyncEvent(eventType: string): void {
    this.syncEventsCounter.inc({ event_type: eventType });
  }
}
