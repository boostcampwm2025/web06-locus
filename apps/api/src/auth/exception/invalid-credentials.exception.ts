import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { AuthErrorCode } from './auth.error-code';

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.INVALID_CREDENTIALS,
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }
}
