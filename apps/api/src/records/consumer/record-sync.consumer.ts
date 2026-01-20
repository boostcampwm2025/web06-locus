import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { RecordSyncEvent } from '../type/record-sync.types';
import { RecordSearchService } from '../records-search.service';
import { OUTBOX_EVENT_TYPE } from '@/common/constants/event-types.constants';

@Controller()
export class RecordSyncConsumer {
  private readonly logger = new Logger(RecordSyncConsumer.name);

  constructor(private readonly recordSearchService: RecordSearchService) {}

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

    try {
      // 이벤트 타입에 따라 처리
      switch (event.eventType) {
        case OUTBOX_EVENT_TYPE.RECORD_CREATED:
          await this.recordSearchService.indexRecord(event.payload);
          break;
        case OUTBOX_EVENT_TYPE.RECORD_UPDATED:
          await this.recordSearchService.updateRecord(event.payload);
          break;
        case OUTBOX_EVENT_TYPE.RECORD_DELETED:
          await this.recordSearchService.deleteRecord(event.aggregateId);
          break;
      }

      // 성공 시 ACK → RabbitMQ에서 메시지 제거
      channel.ack(message);
      this.logger.log(`✅ Event ${event.eventId} 처리완료 및 ACK`);
    } catch (error) {
      this.logger.error(`❌ Event ${event.eventId} 처리 실패`, error);

      // 실패 시 NACK (requeue: true)
      // → RabbitMQ가 메시지를 큐에 다시 넣음
      channel.nack(message, false, true);
      this.logger.warn(`↩️ Event ${event.eventId} 재시도를 위해 큐에 넣음.`);
    }
  }
}
