import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { BaseMessage } from 'firebase-admin/messaging';
import { FIREBASE_PROVIDER } from '@/notification/firebase.config';
import { isTokenExpiredError } from '../exception/firebase-error.guard';
import {
  DAILY_REMINDER_TEMPLATE,
  NotificationType,
} from '../constants/notification.constants';
import { NotificationData } from '../type/notification.types';
import { NotificationService } from '../notification.service';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(FIREBASE_PROVIDER) private firebaseAdmin: admin.app.App,
  ) {}

  // 여러 사용자에게 배치 데일리 알림 전송
  async sendDailyReminderBatch(
    notifyDatas: NotificationData[],
  ): Promise<NotificationData[]> {
    // FCM 배치 전송
    const tokens = notifyDatas.map((n) => n.token);
    const dailyReminderMessage = this.buildDailyReminderContent();
    const batchResponse = await this.sendMulticastPushNotification(
      tokens,
      dailyReminderMessage,
    );

    return batchResponse.responses.reduce((acc, response, index) => {
      if (!response.success) {
        if (isTokenExpiredError(response.error)) {
          this.notificationService
            .deactivate(BigInt(notifyDatas[index].userId))
            .catch(() => {
              this.logger.error(`Failed to deactivate token`);
            });
        } else acc.push(notifyDatas[index]);
      }
      return acc;
    }, [] as NotificationData[]);
  }

  /**
   * FCM 푸시 전송
   * @see https://firebase.google.com/docs/cloud-messaging/send/admin-sdk?hl=ko#send-messages-to-specific-devices
   * @see https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
   */
  private async sendPushNotification(
    token: string,
    messagePayload: BaseMessage,
  ) {
    const message: admin.messaging.Message = {
      token,
      ...messagePayload,
    };
    return this.firebaseAdmin.messaging().send(message);
  }

  /**
   * FCM 멀티캐스트 전송 (최대 500개)
   * @see https://firebase.google.com/docs/cloud-messaging/send-message#send-a-batch-of-messages
   */
  private async sendMulticastPushNotification(
    tokens: string[],
    messagePayload: BaseMessage,
  ): Promise<admin.messaging.BatchResponse> {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      ...messagePayload,
    };
    return await this.firebaseAdmin.messaging().sendEachForMulticast(message);
  }

  private buildDailyReminderContent(): BaseMessage {
    return {
      notification: {
        title: DAILY_REMINDER_TEMPLATE.title,
        body: DAILY_REMINDER_TEMPLATE.body,
      },
      data: { type: NotificationType.DAILY_REMINDER },
      webpush: {
        notification: {
          title: DAILY_REMINDER_TEMPLATE.title,
          body: DAILY_REMINDER_TEMPLATE.body,
          icon: DAILY_REMINDER_TEMPLATE.icon,
          badge: DAILY_REMINDER_TEMPLATE.badge,
          tag: DAILY_REMINDER_TEMPLATE.tag,
          requireInteraction: false,
        },
        fcmOptions: { link: DAILY_REMINDER_TEMPLATE.link },
      },
    };
  }
}
