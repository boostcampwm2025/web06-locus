import { BusinessException } from '@/common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { DuckErrorCode } from '../constants/error-codes';

// AI 설정(URL, API Key)이 없을 때
export class AiConfigMissingException extends BusinessException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      DuckErrorCode.AI_CONFIG_MISSING,
      'AI 서비스 설정값이 누락되었습니다. .env 파일을 확인해주세요.',
    );
  }
}

// AI 호출 자체가 실패했을 때 (Axios 에러 등)
export class AiGenerationFailedException extends BusinessException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      DuckErrorCode.AI_GENERATION_FAILED,
      '오리 코멘트 생성에 실패했습니다.',
    );
  }
}

// AI 응답은 왔지만 JSON 파싱에 실패했을 때
export class AiParseFailedException extends BusinessException {
  constructor(rawContent: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      DuckErrorCode.AI_PARSE_FAILED,
      'AI 응답 형식이 올바르지 않습니다.',
      { raw_content: rawContent },
    );
  }
}
