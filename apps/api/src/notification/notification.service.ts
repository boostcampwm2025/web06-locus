import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationSettingRequestDto } from './dto/update-notification-setting.dto';
import { FcmTokenRequiredException } from './exception/notification.exception';
import { NotificationScheduleService } from './notification-schedule.service';
import { UserNotificationSetting } from '@prisma/client';
import { NotificationSettingResponseDto } from './dto/notification-setting-response.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationScheduleService: NotificationScheduleService,
  ) {}

  async updateSetting(
    userId: bigint,
    dto: UpdateNotificationSettingRequestDto,
  ): Promise<NotificationSettingResponseDto> {
    const { isActive, fcmToken } = dto;

    if (isActive && !fcmToken) throw new FcmTokenRequiredException();

    // 기존 설정 조회
    const oldSetting = await this.prisma.userNotificationSetting.findUnique({
      where: { userId },
    });

    // DB 업데이트 (upsert)
    const newSetting = await this.prisma.userNotificationSetting.upsert({
      where: { userId },
      update: {
        isActive,
        fcmToken: isActive ? fcmToken : null,
      },
      create: {
        userId,
        isActive,
        fcmToken: isActive ? fcmToken : null,
      },
    });

    // Redis 업데이트
    await this.syncRedis(oldSetting, newSetting, userId);

    return {
      isActive: newSetting.isActive,
      notifyTime: newSetting.notifyTime,
    };
  }

  async deactivate(userId: bigint) {
    await this.prisma.userNotificationSetting.update({
      where: { userId },
      data: { isActive: false, fcmToken: null },
    });
  }

  private async syncRedis(
    oldSetting: UserNotificationSetting | null,
    newSetting: UserNotificationSetting,
    userId: bigint,
  ): Promise<void> {
    // 활성화 상태였다면 이전 시간대에서 제거
    if (oldSetting?.isActive && oldSetting.notifyTime) {
      await this.notificationScheduleService.removeUserFromBucket(
        oldSetting.notifyTime,
        userId,
      );
    }

    // 알림 설정시 새 시간대에 추가
    if (newSetting.isActive && newSetting.fcmToken) {
      await this.notificationScheduleService.addUserToBucket(
        newSetting.notifyTime,
        userId,
        newSetting.fcmToken,
      );
    }
  }
}
