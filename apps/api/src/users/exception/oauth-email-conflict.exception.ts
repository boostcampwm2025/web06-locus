import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { UsersErrorCode } from './users.error-code';

export class OAuthEmailConflictException extends BusinessException {
  constructor(provider: string) {
    super(
      HttpStatus.CONFLICT,
      UsersErrorCode.OAUTH_EMAIL_CONFLICT,
      `이 이메일은 이미 ${provider} 계정으로 가입되어 있습니다.`,
      { provider },
    );
  }
}
