import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseSuccessDto<T> {
  @ApiProperty({ example: 'success' })
  status: 'success';

  @ApiProperty()
  data: T;
}

export class ApiResponseFailDto {
  @ApiProperty({ example: 'fail' })
  status: 'fail';

  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code: string;

  @ApiProperty({ example: '요청 값 검증에 실패했습니다', required: false })
  message?: string;

  @ApiProperty({ required: false })
  details?: unknown;
}

export class ApiResponseErrorDto {
  @ApiProperty({ example: 'error' })
  status: 'error';

  @ApiProperty({ example: 'Internal Server Error' })
  message: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  details?: unknown;
}
