import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';
import { CreateTagRequestDto } from '../dto/create-tag.request.dto';
import { CreateTagResponseDto } from '../dto/create-tag.response.dto';
import { DeleteTagResponseDto } from '../dto/delete-tag.response.dto';
import { TagsResponseDto } from '../dto/tags.response.dto';
import { ErrorCodes } from '../constants/error-codes';

export const CreateTagSwagger = () =>
  applyDecorators(
    ApiExtraModels(CreateTagResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '태그 생성',
      description: '새로운 사용자 태그를 생성합니다.',
    }),
    ApiBody({ type: CreateTagRequestDto }),
    ApiSuccessResponse(CreateTagResponseDto, HttpStatus.CREATED),
    ApiFailResponse(HttpStatus.BAD_REQUEST, {
      code: ErrorCodes.INVALID_TAG_NAME,
      message: '유효하지 않은 태그 이름입니다.',
    }),
    ApiFailResponse(HttpStatus.CONFLICT, {
      code: ErrorCodes.TAG_ALREADY_EXISTS,
      message: '이미 존재하는 태그입니다.',
    }),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );

export const DeleteTagSwagger = () =>
  applyDecorators(
    ApiExtraModels(DeleteTagResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '태그 삭제',
      description: '사용자 태그를 삭제합니다.',
    }),
    ApiParam({
      name: 'publicId',
      description: '삭제할 태그의 공개 ID',
      example: 'tag_A1b2C3',
    }),
    ApiSuccessResponse(DeleteTagResponseDto),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiFailResponse(HttpStatus.FORBIDDEN, {
      code: ErrorCodes.NOT_ALLOWED_DELETE_TAG,
      message: '태그 삭제 권한이 없습니다.',
    }),
    ApiFailResponse(HttpStatus.NOT_FOUND, {
      code: ErrorCodes.TAG_NOT_FOUND,
      message: '태그를 찾을 수 없습니다.',
    }),
    ApiFailResponse(HttpStatus.CONFLICT, {
      code: ErrorCodes.SYSTEM_TAG_NOT_DELETABLE,
      message: '시스템 태그는 삭제할 수 없습니다.',
    }),
    ApiErrorResponse(),
  );

export const GetTagsSwagger = () =>
  applyDecorators(
    ApiExtraModels(TagsResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '태그 목록 조회',
      description: '사용자의 태그 목록을 조회합니다.',
    }),
    ApiSuccessResponse(TagsResponseDto),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );
