import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiFailResponse,
  ApiErrorResponse,
} from '@/common/utils/swagger-response.helper';
import { RecordResponseDto } from '../dto/record-response.dto';
import { RecordErrorCode } from '../constants/error-codes';

export const CreateRecordSwagger = () =>
  applyDecorators(
    ApiExtraModels(RecordResponseDto),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
      summary: '기록 생성',
      description:
        '새로운 위치 기반 기록을 생성합니다. 이미지는 선택 사항이며 최대 5개까지 업로드 가능합니다.',
    }),
    ApiSuccessResponse(RecordResponseDto, HttpStatus.CREATED),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: RecordErrorCode.TITLE_MISSING,
        message: '제목이 누락되었습니다.',
      },
      {
        code: RecordErrorCode.TITLE_TOO_LONG,
        message: '제목이 너무 깁니다. (최대 100자)',
      },
      {
        code: RecordErrorCode.LOCATION_MISSING,
        message: '위치 정보가 누락되었습니다.',
      },
      {
        code: RecordErrorCode.INVALID_IMAGE_FORMAT,
        message: '지원하지 않는 이미지 형식입니다.',
      },
      {
        code: RecordErrorCode.IMAGE_SIZE_EXCEEDED,
        message: '이미지 파일 크기가 초과되었습니다. (최대 2MB)',
      },
      {
        code: RecordErrorCode.TOO_MANY_IMAGES,
        message: '이미지 개수가 초과되었습니다. (최대 5개)',
      },
      {
        code: RecordErrorCode.INVALID_JSON_FORMAT,
        message: 'JSON 형식이 올바르지 않습니다.',
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );

export const DeleteRecordSwagger = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '기록 삭제',
      description: '기록을 삭제합니다. 연결된 이미지도 함께 삭제됩니다.',
    }),
    ApiParam({
      name: 'publicId',
      description: '삭제할 기록의 공개 ID',
      example: 'abc123xyz789',
    }),
    ApiNoContentResponse({
      description: '기록 삭제 성공',
    }),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiFailResponse(HttpStatus.FORBIDDEN, {
      code: RecordErrorCode.RECORD_ACCESS_DENIED,
      message: '해당 기록에 대한 권한이 없습니다.',
    }),
    ApiFailResponse(HttpStatus.NOT_FOUND, {
      code: RecordErrorCode.RECORD_NOT_FOUND,
      message: '기록을 찾을 수 없습니다.',
    }),
    ApiErrorResponse(),
  );
