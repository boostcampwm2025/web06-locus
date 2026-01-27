import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  UpdateNotificationSettingRequestDto,
  UpdateNotifyTimeDto,
} from './dto/update-notification-setting.dto';
import {
  UpdateNotificationSettingSwagger,
  UpdateNotifyTimeSwagger,
} from './swagger/notification.swagger';
import { NotificationSettingResponseDto } from './dto/notification-setting-response.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('settings')
  @UpdateNotificationSettingSwagger()
  async updateSettings(
    @CurrentUser('sub') userId: bigint,
    @Body() dto: UpdateNotificationSettingRequestDto,
  ): Promise<NotificationSettingResponseDto> {
    return await this.notificationService.updateSetting(userId, dto);
  }

  @Patch('settings/time')
  @UpdateNotifyTimeSwagger()
  async updateNotifyTime(
    @CurrentUser('sub') userId: bigint,
    @Body() dto: UpdateNotifyTimeDto,
  ): Promise<NotificationSettingResponseDto> {
    return await this.notificationService.updateNotifyTime(userId, dto);
  }
}
