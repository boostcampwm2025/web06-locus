import { BusinessException } from '@/common/exceptions/business.exception';
import { ConnectionErrorCode } from './connection.error.type';

export class SameRecordConnectionNotAllowedException extends BusinessException {
  constructor(recordId: string) {
    super(
      400,
      ConnectionErrorCode.INVALID_CONNECTION,
      '같은 기록끼리는 연결할 수 없습니다.',
      {
        record_id: recordId,
      },
    );
  }
}

export class RecordAccessDeniedException extends BusinessException {
  constructor(recordId: string) {
    super(
      403,
      ConnectionErrorCode.RECORD_ACCESS_DENIED,
      '해당 기록에 대한 권한이 없습니다.',
      {
        record_id: recordId,
      },
    );
  }
}

export class RecordNotFoundException extends BusinessException {
  constructor(recordId: string) {
    super(
      404,
      ConnectionErrorCode.RECORD_NOT_FOUND,
      '기록을 찾을 수 없습니다.',
      {
        record_id: recordId,
      },
    );
  }
}

export class PairConnectionNotFoundException extends BusinessException {
  constructor(recordId: string) {
    super(
      404,
      ConnectionErrorCode.PAIR_CONNECTION_NOT_FOUND,
      '역방향 기록을 찾을 수 없습니다.',
      {
        record_id: recordId,
      },
    );
  }
}

export class ConnectionAlreadyExistsException extends BusinessException {
  constructor(fromRecordId: string, toRecordId: string) {
    super(
      409,
      ConnectionErrorCode.CONNECTION_ALREADY_EXISTS,
      '이미 존재하는 연결입니다.',
      {
        from_record_id: fromRecordId,
        to_record_id: toRecordId,
      },
    );
  }
}
