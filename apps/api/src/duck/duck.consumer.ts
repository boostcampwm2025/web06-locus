import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { RmqRetryService } from '@/mq/rmq-retry.service';
import { DuckService } from './duck.service';
import { DuckRecordCreatedEvent } from './types/duck-record-created.event';

@Controller()
export class DuckConsumer {
  private readonly logger = new Logger(DuckConsumer.name);

  constructor(
    private readonly duckService: DuckService,
    private readonly rmqRetryService: RmqRetryService,
  ) {}

  /**
   * 기록 생성 이벤트 → 오리 멘트 갱신
   * - ES 동기화(record.sync.queue)와 분리된 전용 큐(duck.record-created.queue)를 사용한다.
   *   ES 쪽 실패·재시도가 오리 카운트를 중복으로 올리지 않고, 오리 처리 실패가 ES 동기화를 막지 않는다.
   * - 수동 ACK: 성공(중복 이벤트 포함) 시 ACK, 실패 시 RmqRetryService(재시도 상한 + DLQ)
   * - 멱등성은 DuckService가 이벤트 ID로 보장한다.
   */
  @EventPattern(RABBITMQ_CONSTANTS.PATTERNS.DUCK_RECORD_CREATED)
  async handleRecordCreated(
    @Payload() event: DuckRecordCreatedEvent,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    try {
      const result = await this.duckService.handleRecordCreated(event);
      channel.ack(message);
      this.logger.log(`✅ Duck Event ${event.eventId} ${result} 및 ACK`);
    } catch (error) {
      this.logger.error(`❌ Duck Event ${event.eventId} 처리 실패`, error);
      const outcome = await this.rmqRetryService.handleFailure(context, error);
      this.logger.warn(
        `Duck Event ${event.eventId} 실패 처리 결과: ${outcome}`,
      );
    }
  }
}
