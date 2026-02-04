import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Outbox, OutboxStatus } from '@prisma/client';
import { lastValueFrom, timeout } from 'rxjs';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import {
  OutboxEventType,
  AggregateType,
  OutboxEvent,
} from '@/common/constants/event-types.constants';
import { OutboxService } from './outbox.service';
import { OutboxMetricsService } from '@/infra/monitoring/services/outbox-metrics.service';
import { RabbitMQMetricsService } from '@/infra/monitoring/services/rabbitmq-metrics.service';

@Injectable()
export class OutboxPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private isProcessing = false;
  private readonly MAX_RETRY_COUNT = 5;

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(RABBITMQ_CONSTANTS.CLIENTS.RECORD_SYNC_PRODUCER)
    private readonly client: ClientProxy,
    private readonly outboxMetricsService: OutboxMetricsService,
    private readonly rabbitMQMetricsService: RabbitMQMetricsService,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('🐰 RabbitMQ에 연결');
    } catch (error) {
      this.logger.error('❌ RabbitMQ에 연결 실패', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('👋 RabbitMQ 연결 해제');
  }

  @Cron(CronExpression.EVERY_5_SECONDS) // 5초
  async publishPendingEvents(): Promise<void> {
    if (this.isProcessing) return; // 중복 실행 방지
    this.isProcessing = true;

    try {
      const events = await this.outboxService.getPendingOutboxEvents();

      for (const event of events) {
        await this.processEvent(event);
      }
    } catch (error) {
      this.logger.error('pending event publish 중 에러 발생', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 개별 이벤트 처리
   * - RabbitMQ로 발행 시도
   * - 성공/실패에 따라 Outbox 상태 업데이트
   */
  private async processEvent(event: Outbox): Promise<void> {
    try {
      const outboxEvent = this.convertToOutboxEvent(event);
      await this.sendToRabbitMQ(outboxEvent);
      await this.outboxService.updateStatus(event.id, OutboxStatus.DONE);

      this.outboxMetricsService.recordStatusTransition(
        OutboxStatus.PENDING,
        OutboxStatus.DONE,
        event.eventType,
      );

      const processingTime = (Date.now() - event.createdAt.getTime()) / 1000;
      this.outboxMetricsService.recordProcessingDuration(
        event.eventType,
        processingTime,
      );
      this.outboxMetricsService.recordPublishSuccess(event.eventType);
    } catch (_error) {
      this.outboxMetricsService.recordPublishFailure(event.eventType);
      await this.handlePublishFailure(event);
    }
  }

  private convertToOutboxEvent(outbox: Outbox): OutboxEvent {
    return {
      eventId: outbox.id.toString(),
      eventType: outbox.eventType as OutboxEventType,
      aggregateId: outbox.aggregateId.toString(),
      aggregateType: outbox.aggregateType as AggregateType,
      payload: outbox.payload,
      timestamp: new Date().toISOString(),
    };
  }

  private async sendToRabbitMQ(event: OutboxEvent) {
    try {
      await lastValueFrom(
        this.client
          .emit(RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC, event)
          .pipe(timeout(5000)),
      );

      this.rabbitMQMetricsService.recordPublishSuccess(
        RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC,
      );
      this.logger.log(`✅ ${event.eventId} Event가 RabbitMQ에 publish`);
    } catch (error) {
      this.rabbitMQMetricsService.recordPublishFailure(
        RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC,
      );
      throw error;
    }
  }

  private async handlePublishFailure(outbox: Outbox): Promise<void> {
    const retryCount = outbox.retryCount + 1;
    const isDead = retryCount >= this.MAX_RETRY_COUNT;

    if (isDead) {
      await this.outboxService.updateStatus(outbox.id, OutboxStatus.DEAD);

      this.outboxMetricsService.recordStatusTransition(
        OutboxStatus.PENDING,
        OutboxStatus.DEAD,
        outbox.eventType,
      );
      this.outboxMetricsService.recordDeadLetter(outbox.eventType);
      this.logger.error(
        `🚨 DLQ: Event ${outbox.id}가 최종 실패 처리되었습니다.`,
      );
    } else {
      await this.outboxService.updateStatus(outbox.id, OutboxStatus.RETRY);

      this.outboxMetricsService.recordStatusTransition(
        OutboxStatus.PENDING,
        OutboxStatus.RETRY,
        outbox.eventType,
      );

      this.logger.warn(
        `⚠️ Event ${outbox.id} 발행 실패 (재시도 ${retryCount} / 5)`,
      );
    }
  }
}
