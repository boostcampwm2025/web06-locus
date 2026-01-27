import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { NotificationData } from './type/notification.types';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationScheduleService {
  private readonly BUCKET_PREFIX = 'notify:bucket';
  private readonly START_HOUR = 6;
  private readonly END_HOUR = 23;
  private readonly TIME_SLOTS: string[];

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.TIME_SLOTS = this.generateTimeSlots();
  }

  // 특정 시간 버킷에 (사용자, fcm 토큰) 추가
  async addUserToBucket(
    time: string,
    userId: bigint,
    fcmToken: string,
  ): Promise<void> {
    const key = this.getBucketKey(time);
    await this.redisService.hSet(key, userId.toString(), fcmToken);
  }

  // 특정 시간 버킷에서 사용자 제거
  async removeUserFromBucket(time: string, userId: bigint): Promise<void> {
    const key = this.getBucketKey(time);
    await this.redisService.hDel(key, userId.toString());
  }

  // 특정 시간의 모든 사용자 및 FCM 토큰 조회
  async getUsersForTime(time: string): Promise<NotificationData[]> {
    const key = this.getBucketKey(time);
    const datas = await this.redisService.hGetAll(key);

    return Object.entries(datas).map(([userId, token]) => ({
      userId,
      token,
    }));
  }

  // 모든 버킷에서 해당 사용자 제거 (알림 시간 수정 및 삭제시)
  async removeUserFromAllBuckets(userId: bigint): Promise<void> {
    const pipeline = this.redisService.getClient().multi();
    const userIdStr = userId.toString();
    this.TIME_SLOTS.forEach((time) => {
      pipeline.hDel(this.getBucketKey(time), userIdStr);
    });

    await pipeline.exec();
  }

  async restoreFromDatabase(): Promise<void> {
    const settings = await this.prisma.userNotificationSetting.findMany({
      where: { isActive: true, fcmToken: { not: null } },
      select: {
        userId: true,
        notifyTime: true,
        fcmToken: true,
      },
    });

    const pipeline = this.redisService.getClient().multi();

    for (const setting of settings) {
      const time = setting.notifyTime.substring(0, 5);
      const key = this.getBucketKey(time);
      pipeline.hSet(key, setting.userId.toString(), setting.fcmToken!);
    }
    await pipeline.exec();
  }

  private getBucketKey(time: string): string {
    return `${this.BUCKET_PREFIX}:${time}`;
  }

  private generateTimeSlots = (): string[] => {
    const slots: string[] = [];

    // 18 * 60 = 1080
    for (let h = this.START_HOUR; h <= this.END_HOUR; h++) {
      const HH = h.toString().padStart(2, '0');
      for (let m = 0; m < 60; m++) {
        slots.push(`${HH}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };
}
