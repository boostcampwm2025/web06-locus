import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { RecordSyncEvent, RecordSyncPayload } from '../type/record-sync.types';
import { RecordSearchService } from '../services/records-search.service';
import { OUTBOX_EVENT_TYPE } from '@/common/constants/event-types.constants';
import { VersionedWriteResult } from '@/infra/elasticsearch/types/elasticsearch.types';

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
   *
   * [멱등성 · 순서]
   * - 최소 한 번 전달이므로 같은 이벤트가 여러 번, 순서가 뒤바뀌어 도착할 수 있다.
   * - 삭제가 아닌 모든 이벤트는 "완전한 스냅샷"을 싣고 있어 ES 문서를 통째로 덮어쓴다.
   * - 이벤트 ID(outbox id, 단조 증가)를 ES external version으로 사용한다.
   *   → 이미 같거나 더 높은 버전이 반영돼 있으면 ES가 쓰기를 거절하고(STALE),
   *     이는 오류가 아니라 "이미 반영됨"이므로 ACK한다.
   *   → 중복·지연·역순 이벤트가 도착해도 최종 상태는 가장 높은 버전의 스냅샷이 된다.
   */
  @EventPattern(RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC)
  async handleRecordSync(
    @Payload() event: RecordSyncEvent,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    try {
      const result = await this.applyEvent(event);

      // 성공(또는 이미 반영된 STALE) 시 ACK → RabbitMQ에서 메시지 제거
      channel.ack(message);
      if (result === 'STALE') {
        this.logger.log(
          `⏭️ Event ${event.eventId} 이미 더 최신 버전이 반영되어 건너뜀 (ACK)`,
        );
      } else {
        this.logger.log(`✅ Event ${event.eventId} 처리완료 및 ACK`);
      }
    } catch (error) {
      this.logger.error(`❌ Event ${event.eventId} 처리 실패`, error);

      // 실패 시 NACK (requeue: true)
      // → RabbitMQ가 메시지를 큐에 다시 넣음
      channel.nack(message, false, true);
      this.logger.warn(`↩️ Event ${event.eventId} 재시도를 위해 큐에 넣음.`);
    }
  }

  private async applyEvent(
    event: RecordSyncEvent,
  ): Promise<VersionedWriteResult> {
    const version = this.toVersion(event.eventId);

    switch (event.eventType) {
      case OUTBOX_EVENT_TYPE.RECORD_DELETED:
        return this.recordSearchService.deleteRecord(
          event.aggregateId,
          version,
        );
      case OUTBOX_EVENT_TYPE.RECORD_CREATED:
      case OUTBOX_EVENT_TYPE.RECORD_UPDATED:
      case OUTBOX_EVENT_TYPE.RECORD_FAVORITE_UPDATED:
      case OUTBOX_EVENT_TYPE.RECORD_CONNECTIONS_COUNT_UPDATED:
        return this.recordSearchService.upsertRecord(
          event.payload as RecordSyncPayload,
          version,
        );
      default:
        throw new Error(`알 수 없는 이벤트 타입: ${String(event.eventType)}`);
    }
  }

  /**
   * 이벤트 ID(outbox id)를 ES external version으로 변환한다.
   * - ES 버전은 64비트 정수지만, JS Number로 안전하게 다룰 수 있는 범위(2^53-1)까지만 허용
   */
  private toVersion(eventId: string): number {
    const version = Number(eventId);
    if (!Number.isSafeInteger(version) || version <= 0) {
      throw new Error(`유효하지 않은 eventId: ${eventId}`);
    }
    return version;
  }
}
