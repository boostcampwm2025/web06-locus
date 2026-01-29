import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

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

export class UpdateNotifyTimeDto {
  @ApiProperty({
    description: '알림 설정 시간',
    example: '19:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '알림 시간은 HH:mm 형식이어야 합니다.',
  })
  notifyTime: string;
}
