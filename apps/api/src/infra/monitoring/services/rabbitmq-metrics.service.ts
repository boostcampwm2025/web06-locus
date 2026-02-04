import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { RABBITMQ_METRICS } from '@/infra/monitoring/constants/metrics.constants';

@Injectable()
export class RabbitMQMetricsService {
  constructor(
    @InjectMetric(RABBITMQ_METRICS.MESSAGES_PUBLISHED_TOTAL)
    private readonly publishedCounter: Counter<string>,

    @InjectMetric(RABBITMQ_METRICS.MESSAGES_CONSUMED_TOTAL)
    private readonly consumedCounter: Counter<string>,

    @InjectMetric(RABBITMQ_METRICS.MESSAGES_PROCESSING_DURATION_SEC)
    private readonly processingDuration: Histogram<string>,

    @InjectMetric(RABBITMQ_METRICS.MESSAGES_IN_FLIGHT)
    private readonly inFlightGauge: Gauge<string>,
  ) {}

  recordPublishSuccess(pattern: string): void {
    this.publishedCounter.inc({ pattern, status: 'success' });
  }

  recordPublishFailure(pattern: string): void {
    this.publishedCounter.inc({ pattern, status: 'failed' });
  }

  recordConsumeAck(pattern: string): void {
    this.consumedCounter.inc({ pattern, status: 'ack' });
  }

  recordConsumeNack(pattern: string): void {
    this.consumedCounter.inc({ pattern, status: 'nack' });
  }

  recordProcessingDuration(
    pattern: string,
    eventType: string,
    durationSeconds: number,
  ): void {
    this.processingDuration.observe(
      { pattern, event_type: eventType },
      durationSeconds,
    );
  }

  incrementInFlight(pattern: string): void {
    this.inFlightGauge.inc({ pattern });
  }

  decrementInFlight(pattern: string): void {
    this.inFlightGauge.dec({ pattern });
  }
}
