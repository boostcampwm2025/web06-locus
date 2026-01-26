import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';
import { UpdateNotificationSettingRequestDto } from '../dto/update-notification-setting.dto';
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
