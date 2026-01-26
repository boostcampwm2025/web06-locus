import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationSettingRequestDto {
  @ApiProperty({
    description: '알림 활성화 여부',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'FCM 토큰 (isActive가 true라면 필수)',
    example: 'eXaMpLe_FcM_ToKeN_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
