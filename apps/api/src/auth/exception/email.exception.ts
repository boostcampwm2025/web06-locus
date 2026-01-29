import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { AuthErrorCode } from './auth.error-code';

export class EmailAlreadyExistsException extends BusinessException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      AuthErrorCode.EMAIL_ALREADY_EXISTS,
      '이미 가입된 이메일입니다',
    );
  }
}

export class SocialAlreadyLoginException extends BusinessException {
  constructor(provider: string) {
    super(
      HttpStatus.BAD_REQUEST,
      AuthErrorCode.SOCIAL_ACCOUNT_LOGIN,
      `${provider}로 가입된 계정입니다. 해당 소셜 로그인을 이용해주세요.`,
    );
  }
}

export class EmailAlreadySentException extends BusinessException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      AuthErrorCode.EMAIL_ALREADY_SENT,
      '이미 인증 코드가 발송되었습니다.',
    );
  }
}

export class EmailVerificationExpiredException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      AuthErrorCode.EMAIL_VERIFICATION_EXPIRED,
      '인증 정보가 만료되었습니다.',
    );
  }
}

export class EmailVerificationTooManyTriesException extends BusinessException {
  constructor() {
    super(
      HttpStatus.TOO_MANY_REQUESTS,
      AuthErrorCode.EMAIL_VERIFICATION_TOO_MANY_TRIES,
      '인증 시도 횟수를 초과했습니다.',
    );
  }
}

export class EmailVerificationFailedException extends BusinessException {
  constructor(retryCount: number) {
    super(
      HttpStatus.BAD_REQUEST,
      AuthErrorCode.EMAIL_VERIFICATION_FAILED,
      '인증 코드가 올바르지 않습니다.',
      { retryCount },
    );
  }
}

export class EmailDeliveryFailedException extends BusinessException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      AuthErrorCode.EMAIL_DELIVERY_FAILED,
      '이메일 발송에 문제가 발생했습니다.',
    );
  }
}
