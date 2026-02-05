import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { ElasticsearchErrorCode } from './error-codes';

export class ESDocumentNotFoundException extends BusinessException {
  constructor(index: string) {
    super(
      HttpStatus.NOT_FOUND,
      ElasticsearchErrorCode.ES_DOCUMENT_NOT_FOUND,
      'document을 찾을 수 없습니다.',
      { index_name: index },
    );
  }
}
