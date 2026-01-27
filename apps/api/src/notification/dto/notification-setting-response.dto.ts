import { ApiProperty } from '@nestjs/swagger';
import { UserNotificationSetting } from '@prisma/client';

export class NotificationSettingResponseDto {
  @ApiProperty({
    description: '알림 활성화 여부',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '알림 설정 시간',
    example: '19:00',
  })
  notifyTime: string;

  static from(
    setting: UserNotificationSetting,
  ): NotificationSettingResponseDto {
    return { isActive: setting.isActive, notifyTime: setting.notifyTime };
  }
}
