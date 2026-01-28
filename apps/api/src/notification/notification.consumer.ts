import { Controller, Inject, Logger } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  ClientProxy,
} from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { FcmService } from './fcm/fcm.service';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import {
  NotificationBatchMessage,
  NotificationData,
} from './type/notification.types';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(
    private readonly fcmService: FcmService,
    @Inject(RABBITMQ_CONSTANTS.CLIENTS.NOTIFICATION_BATCH_PRODUCER)
    private readonly notificationClient: ClientProxy,
  ) {}

  @EventPattern(RABBITMQ_CONSTANTS.PATTERNS.NOTIFICATION_SEND_BATCH)
  async handleNotificationBatch(
    @Payload() payload: NotificationBatchMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    const { notifyDatas, attempt } = payload;

    try {
      const retryNotifyDatas =
        await this.fcmService.sendDailyReminderBatch(notifyDatas);

      if (retryNotifyDatas.length > 0) {
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          this.enqueueRetryBatch(retryNotifyDatas, attempt + 1);
        } else {
          this.logger.error(
            `Max retry attempts reached: ${retryNotifyDatas.length}`,
          );
          // TODO: slack 에 알림
        }
      }

      // 성공 ACK
      channel.ack(message);
    } catch (_error) {
      // 배치 전체 실패 시 재시도 (NACK)
      channel.nack(message, false, true);
    }
  }

  private enqueueRetryBatch(
    retryDatas: NotificationData[],
    attempt: number,
  ): void {
    this.notificationClient.emit(
      RABBITMQ_CONSTANTS.PATTERNS.NOTIFICATION_SEND_BATCH,
      { retryDatas, attempt },
    );
  }
}
