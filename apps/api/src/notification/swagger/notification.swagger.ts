import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';
import {
  UpdateNotificationSettingRequestDto,
  UpdateNotifyTimeDto,
} from '../dto/update-notification-setting.dto';
import { NotificationSettingResponseDto } from '../dto/notification-setting-response.dto';
import { NotificationErrorCode } from '../exception/notification-error-code';

export const UpdateNotificationSettingSwagger = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '알림 설정 업데이트',
      description: '사용자의 알림 활성화 여부 및 FCM 토큰을 업데이트합니다.',
    }),
    ApiBody({ type: UpdateNotificationSettingRequestDto }),
    ApiSuccessResponse(NotificationSettingResponseDto),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: NotificationErrorCode.FCM_TOKEN_REQUIRED,
        message: '알림을 활성화하려면 FCM 토큰이 반드시 필요합니다.',
      },
      {
        code: 'VALIDATION_FAILED',
        message: '요청 값 검증에 실패했습니다',
        details: {
          isActive: ['isActive must be a boolean'],
        },
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'INVALID_ACCESS_TOKEN',
      message: '유효하지 않은 Access Token입니다',
    }),
    ApiErrorResponse(),
  );

export const UpdateNotifyTimeSwagger = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '알림 시간 수정',
      description: '사용자의 알림 시간을 HH:mm 형식으로 수정합니다.',
    }),
    ApiBody({ type: UpdateNotifyTimeDto }),
    ApiSuccessResponse(NotificationSettingResponseDto),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: NotificationErrorCode.INACTIVE_NOTIFICATION,
        message: '알림 시간은 HH:mm 형식이어야 합니다.',
      },
      {
        code: 'VALIDATION_FAILED',
        message: '요청 값 검증에 실패했습니다',
        details: {
          notifyTime: ['알림 시간은 HH:mm 형식이어야 합니다.'],
        },
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'INVALID_ACCESS_TOKEN',
      message: '유효하지 않은 Access Token입니다.',
    }),
    ApiErrorResponse(),
  );
