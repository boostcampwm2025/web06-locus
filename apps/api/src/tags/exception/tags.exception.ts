import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '../constants/error-codes';

export class TagAlreadyExistsException extends BusinessException {
  constructor(name: string) {
    super(409, ErrorCodes.TAG_ALREADY_EXISTS, '이미 존재하는 태그입니다.', {
      name,
    });
  }
}

export class TagNotFoundException extends BusinessException {
  constructor(tagId: string) {
    super(404, ErrorCodes.TAG_NOT_FOUND, '태그를 찾을 수 없습니다.', { tagId });
  }
}

export class InvalidTagNameException extends BusinessException {
  constructor(name: string) {
    super(400, ErrorCodes.INVALID_TAG_NAME, '유효하지 않은 태그 이름입니다.', {
      name,
    });
  }
}

export class TagForbiddenException extends BusinessException {
  constructor(tagId: string) {
    super(
      403,
      ErrorCodes.NOT_ALLOWED_DELETE_TAG,
      '태그 삭제 권한이 없습니다.',
      { tagId },
    );
  }
}

export class SystemTagNotDeletableException extends BusinessException {
  constructor(tagId: string) {
    super(
      409,
      ErrorCodes.SYSTEM_TAG_NOT_DELETABLE,
      '시스템 태그는 삭제할 수 없습니다.',
      { tagId },
    );
  }
}
