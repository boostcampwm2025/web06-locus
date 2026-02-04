import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { OUTBOX_METRICS } from '../constants/metrics.constants';

@Injectable()
export class OutboxMetricsService {
  constructor(
    @InjectMetric(OUTBOX_METRICS.OUTBOX_EVENTS_PUBLISHED_TOTAL)
    private readonly publishedCounter: Counter<string>,

    @InjectMetric(OUTBOX_METRICS.STATUS_TRANSITIONS_TOTAL)
    private readonly statusTransitionCounter: Counter<string>,

    @InjectMetric(OUTBOX_METRICS.OUTBOX_PROCESSING_DURATION_SEC)
    private readonly processingDuration: Histogram<string>,

    @InjectMetric(OUTBOX_METRICS.OUTBOX_DEAD_LETTER_TOTAL)
    private readonly deadLetterCounter: Counter<string>,
  ) {}

  recordPublishSuccess(eventType: string): void {
    this.publishedCounter.inc({ status: 'success', event_type: eventType });
  }

  recordPublishFailure(eventType: string): void {
    this.publishedCounter.inc({ status: 'failed', event_type: eventType });
  }

  recordProcessingDuration(eventType: string, durationSeconds: number): void {
    this.processingDuration.observe({ event_type: eventType }, durationSeconds);
  }

  recordDeadLetter(eventType: string): void {
    this.deadLetterCounter.inc({ event_type: eventType });
  }

  recordStatusTransition(
    fromStatus: string,
    toStatus: string,
    eventType: string,
  ): void {
    this.statusTransitionCounter.inc({
      from_status: fromStatus,
      to_status: toStatus,
      event_type: eventType,
    });
  }
}
