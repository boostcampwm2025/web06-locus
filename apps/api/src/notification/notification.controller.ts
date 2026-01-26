import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateNotificationSettingRequestDto } from './dto/update-notification-setting.dto';
import { UpdateNotificationSettingSwagger } from './swagger/notification.swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Patch('settings')
  @UpdateNotificationSettingSwagger()
  async updateSettings(
    @CurrentUser('sub') userId: bigint,
    @Body() dto: UpdateNotificationSettingRequestDto,
  ) {
    return await this.notificationService.updateSetting(userId, dto);
  }
}
