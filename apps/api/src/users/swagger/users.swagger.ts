import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';
import { UsersErrorCode } from '../exception/users.error-code';

export const GetMyProfileSwagger = () =>
  applyDecorators(
    ApiExtraModels(UserResponseDto),
    ApiOperation({
      summary: '내 프로필 조회',
      description:
        '액세스 토큰을 사용하여 현재 로그인한 사용자의 프로필 정보를 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiSuccessResponse(UserResponseDto),
    ApiFailResponse(401, {
      code: 'INVALID_ACCESS_TOKEN',
      message: '유효하지 않은 액세스 토큰입니다.',
    }),
    ApiFailResponse(404, {
      code: UsersErrorCode.USER_NOT_FOUND,
      message: '사용자를 찾을 수 없습니다.',
    }),
    ApiErrorResponse(),
  );
