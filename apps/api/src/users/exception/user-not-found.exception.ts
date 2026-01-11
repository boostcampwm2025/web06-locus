import { BusinessException } from '@/common/exceptions/business.exception';
import { UsersErrorCode } from './users.error-code';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BusinessException {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      UsersErrorCode.USER_NOT_FOUND,
      '사용자를 찾을 수 없습니다.',
    );
  }
}
