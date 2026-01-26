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
import { RecordListResponseDto } from '../dto/records-list-reponse.dto';
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

export const GetRecordsSwagger = () =>
  applyDecorators(
    ApiExtraModels(RecordListResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '지도 범위 기반 기록 조회',
      description:
        '지도에서 사용자가 보고 있는 범위(Bounding Box) 내에 위치한 기록들을 조회합니다. 페이지네이션을 지원하며, 최신순 또는 오래된순으로 정렬할 수 있습니다.',
    }),
    ApiSuccessResponse(RecordListResponseDto, HttpStatus.OK),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: RecordErrorCode.BOUNDS_MISSING,
        message: '지도 범위 파라미터가 누락되었습니다.',
      },
      {
        code: RecordErrorCode.INVALID_LATITUDE,
        message: '위도 값이 유효하지 않습니다. (-90 ~ 90)',
      },
      {
        code: RecordErrorCode.INVALID_LONGITUDE,
        message: '경도 값이 유효하지 않습니다. (-180 ~ 180)',
      },
      {
        code: RecordErrorCode.INVALID_BOUNDS,
        message: '지도 범위가 유효하지 않습니다.',
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );

export const GetRecordDetailSwagger = () =>
  applyDecorators(
    ApiExtraModels(RecordResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '기록 상세 조회',
      description: '특정 기록의 상세 정보를 조회합니다.',
    }),
    ApiSuccessResponse(RecordResponseDto, HttpStatus.OK),
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

export const GetRecordsByLocationSwagger = () =>
  applyDecorators(
    ApiExtraModels(RecordListResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '위치 기반 기록 조회',
      description:
        '특정 좌표를 기준으로 지정된 반경 내의 모든 기록을 조회합니다. 동일한 위치에서 생성된 기록들을 찾거나, 특정 장소의 기록들을 확인할 때 사용됩니다.',
    }),
    ApiSuccessResponse(RecordListResponseDto, HttpStatus.OK),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: RecordErrorCode.INVALID_LATITUDE,
        message: '위도 값이 유효하지 않습니다. (-90 ~ 90)',
      },
      {
        code: RecordErrorCode.INVALID_LONGITUDE,
        message: '경도 값이 유효하지 않습니다. (-180 ~ 180)',
      },
      {
        code: RecordErrorCode.INVALID_RADIUS,
        message: '반경 값이 유효하지 않습니다. (5 ~ 50)',
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
