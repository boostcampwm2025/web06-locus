import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Outbox, OutboxStatus } from '@prisma/client';
import { lastValueFrom, timeout } from 'rxjs';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import {
  OUTBOX_EVENT_TYPE,
  OutboxEventType,
  AggregateType,
  OutboxEvent,
} from '@/common/constants/event-types.constants';
import { DuckRecordCreatedEvent } from '@/duck/types/duck-record-created.event';
import { OUTBOX_MAX_RETRY_COUNT, OutboxService } from './outbox.service';

@Injectable()
export class OutboxPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private isProcessing = false;

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(RABBITMQ_CONSTANTS.CLIENTS.RECORD_SYNC_PRODUCER)
    private readonly client: ClientProxy,
    @Inject(RABBITMQ_CONSTANTS.CLIENTS.DUCK_RECORD_CREATED_PRODUCER)
    private readonly duckClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      await this.duckClient.connect();
      this.logger.log('🐰 RabbitMQ에 연결');
    } catch (error) {
      this.logger.error('❌ RabbitMQ에 연결 실패', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    await this.duckClient.close();
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
   * - RabbitMQ로 발행 시도(ES 동기화 큐, 기록 생성이면 오리 큐에도)
   * - 모든 발행이 성공해야 DONE, 하나라도 실패하면 실패로 기록
   * - 한쪽만 성공한 채 재시도되면 성공한 쪽에 중복 전달되지만,
   *   두 컨슈머 모두 이벤트 ID 기준으로 멱등하게 처리하므로 안전하다.
   */
  private async processEvent(event: Outbox): Promise<void> {
    try {
      const outboxEvent = this.convertToOutboxEvent(event);
      await this.sendToRabbitMQ(outboxEvent);
      await this.sendToDuckQueue(outboxEvent);
    } catch (_error) {
      await this.handlePublishFailure(event);
      return;
    }

    // 발행은 성공했으므로 여기서 실패해도 "발행 실패"로 세지 않는다.
    // 상태가 PENDING/RETRY로 남아 다음 주기에 재발행되며(최소 한 번 전달),
    // 중복은 컨슈머의 멱등 처리가 흡수한다.
    await this.outboxService.updateStatus(event.id, OutboxStatus.DONE);
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
    await lastValueFrom(
      this.client
        .emit(RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC, event)
        .pipe(timeout(5000)),
    );
    this.logger.log(`✅ ${event.eventId} Event가 RabbitMQ에 publish`);
  }

  /**
   * 기록 생성 이벤트만 오리 큐로 보낸다. (ES 동기화 큐와 분리된 별도 큐)
   * - 유저 ID를 알 수 없는 이벤트는 오리 갱신 대상이 아니므로 건너뛴다(ES 동기화는 영향 없음).
   */
  private async sendToDuckQueue(event: OutboxEvent) {
    if (event.eventType !== OUTBOX_EVENT_TYPE.RECORD_CREATED) return;

    const userId = (event.payload as { userId?: unknown } | null)?.userId;
    if (typeof userId !== 'string' || userId === '') {
      this.logger.warn(
        `⚠️ ${event.eventId} Event에 userId가 없어 오리 큐 발행을 건너뜀`,
      );
      return;
    }

    const duckEvent: DuckRecordCreatedEvent = {
      eventId: event.eventId ?? '',
      userId,
      recordId: event.aggregateId,
    };
    await lastValueFrom(
      this.duckClient
        .emit(RABBITMQ_CONSTANTS.PATTERNS.DUCK_RECORD_CREATED, duckEvent)
        .pipe(timeout(5000)),
    );
    this.logger.log(`✅ ${event.eventId} Event가 오리 큐에 publish`);
  }

  private async handlePublishFailure(outbox: Outbox): Promise<void> {
    const { status, retryCount } =
      await this.outboxService.markPublishFailed(outbox);

    if (status === OutboxStatus.DEAD) {
      this.logger.error(
        `🚨 DLQ: Event ${outbox.id}가 최종 실패 처리되었습니다.`,
      );
    } else {
      this.logger.warn(
        `⚠️ Event ${outbox.id} 발행 실패 (재시도 ${retryCount} / ${OUTBOX_MAX_RETRY_COUNT})`,
      );
    }
  }
}
