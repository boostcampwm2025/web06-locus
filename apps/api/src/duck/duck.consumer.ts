import { Controller, Logger } from '@nestjs/common';
import { DuckService } from './duck.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { OUTBOX_EVENT_TYPE } from '@/common/constants/event-types.constants';
import {
  RecordSyncEvent,
  RecordSyncPayload,
} from '@/records/type/record-sync.types';

@Controller()
export class DuckConsumer {
  private readonly logger = new Logger(DuckConsumer.name);

  constructor(private readonly duckService: DuckService) {}

  /**
   * RabbitMQ 메시지 수신 및 오리 코멘트 갱신 처리
   * - ACK/NACK 처리는 RecordSyncConsumer에 위임하고, 비즈니스 로직만 수행
   */
  @EventPattern(RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC)
  async handleRecordEvents(@Payload() event: RecordSyncEvent) {
    try {
      if (event.eventType === OUTBOX_EVENT_TYPE.RECORD_CREATED) {
        await this.duckService.handleRecordCreated(
          event.payload as RecordSyncPayload,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Event ${event.eventId} (Duck) 처리 실패`, error);
    }
  }
}
