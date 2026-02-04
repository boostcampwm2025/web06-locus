import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import {
  RecordConnectionsCountSyncPayload,
  RecordFavoriteSyncPayload,
  RecordSyncEvent,
  RecordSyncPayload,
} from '../type/record-sync.types';
import { RecordSearchService } from '../services/records-search.service';
import { OUTBOX_EVENT_TYPE } from '@/common/constants/event-types.constants';
import { RabbitMQMetricsService } from '@/infra/monitoring/services/rabbitmq-metrics.service';
import {
  ESOperation,
  ElasticsearchMetricsService,
} from '@/infra/monitoring/services/elasticsearch-metrics.service';

@Controller()
export class RecordSyncConsumer {
  private readonly logger = new Logger(RecordSyncConsumer.name);

  constructor(
    private readonly recordSearchService: RecordSearchService,
    private readonly rabbitMQMetricsService: RabbitMQMetricsService,
    private readonly esMetricsService: ElasticsearchMetricsService,
  ) {}

  /**
   * RabbitMQ 메시지 수신 및 처리
   * @EventPattern으로 이벤트 수신
   * - 수동 ACK 모드
   * 성공 시 ACK (메시지 큐에서 제거)
   * 실패 시 NACK (메시지 다시 큐에 넣어 재시도)
   * [멱등성]
   * - 같은 recordId로 여러 번 인덱싱해도 안전
   * - ES는 id 기반으로 upsert
   */
  @EventPattern(RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC)
  async handleRecordSync(
    @Payload() event: RecordSyncEvent,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    const pattern = RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC;
    this.rabbitMQMetricsService.incrementInFlight(pattern);
    const startTime = Date.now();

    try {
      await this.processEventByType(event);
      // 성공 시 ACK → RabbitMQ에서 메시지 제거
      channel.ack(message);
      const duration = (Date.now() - startTime) / 1000;

      this.rabbitMQMetricsService.recordConsumeAck(pattern);
      this.rabbitMQMetricsService.recordProcessingDuration(
        pattern,
        event.eventType,
        duration,
      );
      this.esMetricsService.recordSyncEvent(event.eventType);
      this.logger.log(`✅ Event ${event.eventId} 처리완료 및 ACK`);
    } catch (error) {
      this.logger.error(`❌ Event ${event.eventId} 처리 실패`, error);

      // 실패 시 NACK (requeue: true)
      // → RabbitMQ가 메시지를 큐에 다시 넣음
      channel.nack(message, false, true);
      this.rabbitMQMetricsService.recordConsumeNack(pattern);
      this.logger.warn(`↩️ Event ${event.eventId} 재시도를 위해 큐에 넣음.`);
    } finally {
      this.rabbitMQMetricsService.decrementInFlight(pattern);
    }
  }

  private async processEventByType(event: RecordSyncEvent): Promise<void> {
    const startTime = Date.now();
    let operation: ESOperation;

    try {
      switch (event.eventType) {
        case OUTBOX_EVENT_TYPE.RECORD_CREATED:
          operation = 'index';
          await this.recordSearchService.indexRecord(
            event.payload as RecordSyncPayload,
          );
          break;

        case OUTBOX_EVENT_TYPE.RECORD_UPDATED:
          operation = 'update';
          await this.recordSearchService.updateRecord(
            event.payload as RecordSyncPayload,
          );
          break;

        case OUTBOX_EVENT_TYPE.RECORD_FAVORITE_UPDATED:
          operation = 'update';
          await this.recordSearchService.updateFavoriteInRecord(
            event.payload as RecordFavoriteSyncPayload,
          );
          break;

        case OUTBOX_EVENT_TYPE.RECORD_CONNECTIONS_COUNT_UPDATED:
          operation = 'update';
          await this.recordSearchService.updateConnectionsCountInRecord(
            event.payload as RecordConnectionsCountSyncPayload,
          );
          break;

        case OUTBOX_EVENT_TYPE.RECORD_DELETED:
          operation = 'delete';
          await this.recordSearchService.deleteRecord(event.aggregateId);
          break;

        default:
          throw new Error('Unknown event type received');
      }

      const duration = (Date.now() - startTime) / 1000;
      this.esMetricsService.recordOperationSuccess(operation);
      this.esMetricsService.recordOperationDuration(operation, duration);
    } catch (error) {
      this.esMetricsService.recordOperationFailure(operation!);
      throw error;
    }
  }
}
