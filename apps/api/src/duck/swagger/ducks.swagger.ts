import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from '@nestjs/swagger';
import { DuckCommentResponseDto } from '../dto/duck-comment-response.dto';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';

export const DuckCommentSwagger = () =>
  applyDecorators(
    ApiExtraModels(DuckCommentResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '오리 코멘트 반환',
      description: '기록을 바탕으로 오리 코멘트 10개를 반환합니다.',
    }),
    ApiSuccessResponse(DuckCommentResponseDto, HttpStatus.OK),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );
