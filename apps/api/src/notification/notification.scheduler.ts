import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NotificationScheduleService } from './notification-schedule.service';
import { formatDateToTime } from '@/common/utils/date-utils';
import { NotificationData } from './type/notification.types';

@Injectable()
export class NotificationScheduler {
  private readonly BATCH_SIZE = 100;
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly notificationScheduleService: NotificationScheduleService,
    @Inject(RABBITMQ_CONSTANTS.CLIENTS.NOTIFICATION_BATCH_PRODUCER)
    private readonly notificationClient: ClientProxy,
  ) {}

  // 매분마다 실행되어 해당 시간의 사용자들에게 알림 작업을 큐에 추가
  @Cron('0 * 6-23 * * *')
  async scheduleNotificationsBatch() {
    const now = new Date();
    const currentTime = formatDateToTime(now);

    try {
      // Redis에서 현재 시간의 (사용자, token) 조회
      const notificationDatas =
        await this.notificationScheduleService.getUsersForTime(currentTime);
      if (notificationDatas.length === 0) return;

      const batches: NotificationData[][] = [];

      for (let i = 0; i < notificationDatas.length; i += this.BATCH_SIZE) {
        batches.push(notificationDatas.slice(i, i + this.BATCH_SIZE));
      }

      const publishPromises = batches.map((batch) =>
        lastValueFrom(
          this.notificationClient.emit(
            RABBITMQ_CONSTANTS.PATTERNS.NOTIFICATION_SEND_BATCH,
            { notifyDatas: batch, attempt: 1 },
          ),
        ),
      );

      await Promise.all(publishPromises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `[MQ] Failed emit notification batches for ${currentTime}: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
