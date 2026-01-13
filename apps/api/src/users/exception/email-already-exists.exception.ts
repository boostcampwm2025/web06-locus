import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { UsersErrorCode } from './users.error-code';

export class UserEmailAlreadyExistsException extends BusinessException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      UsersErrorCode.EMAIL_ALREADY_EXISTS,
      '이미 존재하는 이메일입니다.',
    );
  }
}
