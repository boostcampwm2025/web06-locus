import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateNotificationSettingRequestDto,
  UpdateNotifyTimeDto,
} from './dto/update-notification-setting.dto';
import {
  FcmTokenRequiredException,
  InactiveNotificationException,
  NotificationNotFoundException,
} from './exception/notification.exception';
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

  async getSetting(userId: bigint): Promise<NotificationSettingResponseDto> {
    const setting = await this.prisma.userNotificationSetting.findUnique({
      where: { userId },
    });

    if (!setting) throw new NotificationNotFoundException();
    return NotificationSettingResponseDto.from(setting);
  }

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

    return NotificationSettingResponseDto.from(newSetting);
  }

  async updateNotifyTime(
    userId: bigint,
    dto: UpdateNotifyTimeDto,
  ): Promise<NotificationSettingResponseDto> {
    const { notifyTime } = dto;
    const setting = await this.prisma.userNotificationSetting.findUnique({
      where: { userId },
    });

    if (!setting) throw new NotificationNotFoundException();
    if (!setting.isActive) throw new InactiveNotificationException();

    const oldTime = setting.notifyTime;

    const updatedSetting = await this.prisma.userNotificationSetting.update({
      where: { userId },
      data: { notifyTime: notifyTime },
    });

    // Redis 업데이트 (시간 변경)
    if (oldTime !== notifyTime && setting.fcmToken) {
      await this.notificationScheduleService.removeUserFromBucket(
        oldTime,
        userId,
      );
      await this.notificationScheduleService.addUserToBucket(
        notifyTime,
        userId,
        setting.fcmToken,
      );
    }
    return NotificationSettingResponseDto.from(updatedSetting);
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
