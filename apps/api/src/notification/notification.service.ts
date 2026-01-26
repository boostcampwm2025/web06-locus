import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async deactivate(userId: bigint) {
    await this.prisma.userNotificationSetting.update({
      where: { userId },
      data: { isActive: false, fcmToken: null },
    });
  }
}
