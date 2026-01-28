import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiFailResponse,
  ApiErrorResponse,
} from '@/common/utils/swagger-response.helper';
import {
  GeocodeResponseDto,
  GeocodeMetaDto,
  AddressDataDto,
} from '../dto/geocode.response.dto';
import { ReverseGeocodeResponseDto } from '../dto/reverse-geocode.response.dto';
import { MapsErrorCode } from '../constants/error-codes';

export const GeocodeSwagger = () =>
  applyDecorators(
    ApiExtraModels(GeocodeResponseDto, GeocodeMetaDto, AddressDataDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '주소로 좌표 조회',
      description:
        '주소를 입력하면 해당 주소의 좌표(위도, 경도)를 반환합니다. 여러 개의 결과가 반환될 수 있습니다.',
    }),
    ApiSuccessResponse(GeocodeResponseDto, HttpStatus.OK),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: MapsErrorCode.ADDRESS_MISSING,
        message: '주소가 누락되었습니다.',
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );

export const ReverseGeocodeSwagger = () =>
  applyDecorators(
    ApiExtraModels(ReverseGeocodeResponseDto),
    ApiBearerAuth(),
    ApiOperation({
      summary: '좌표로 주소 조회',
      description:
        '좌표(위도, 경도)를 입력하면 해당 위치의 장소 이름과 주소를 반환합니다.',
    }),
    ApiSuccessResponse(ReverseGeocodeResponseDto, HttpStatus.OK),
    ApiFailResponse(HttpStatus.BAD_REQUEST, [
      {
        code: MapsErrorCode.INVALID_LATITUDE,
        message: '위도 값이 유효하지 않습니다. (-90 ~ 90)',
      },
      {
        code: MapsErrorCode.INVALID_LONGITUDE,
        message: '경도 값이 유효하지 않습니다. (-180 ~ 180)',
      },
    ]),
    ApiFailResponse(HttpStatus.UNAUTHORIZED, {
      code: 'AUTH_TOKEN_MISSING',
      message: '인증 토큰이 없거나 유효하지 않습니다.',
    }),
    ApiErrorResponse(),
  );
