import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions/business.exception';
import { NotificationErrorCode } from './notification-error-code';

export class FcmTokenRequiredException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      NotificationErrorCode.FCM_TOKEN_REQUIRED,
      '알림을 활성화하려면 FCM 토큰이 반드시 필요합니다.',
    );
  }
}

export class NotificationNotFoundException extends BusinessException {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      NotificationErrorCode.NOT_FOUND_NOTIFICATION,
      '알림 설정이 존재하지 않습니다.',
    );
  }
}

export class InactiveNotificationException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      NotificationErrorCode.INACTIVE_NOTIFICATION,
      '알림이 비활성화 상태입니다. 먼저 알림을 활성화해주세요.',
    );
  }
}
