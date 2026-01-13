import { Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ErrorCase {
  code: string;
  message: string;
  details?: unknown;
}

export const ApiSuccessResponse = <T extends Type>(dataDto: T, status = 200) =>
  ApiResponse({
    status,
    description: '성공',
    content: {
      'application/json': {
        schema: {
          properties: {
            status: { type: 'string', example: 'success' },
            data: { $ref: getSchemaPath(dataDto) },
          },
        },
      },
    },
  });

export const ApiFailResponse = (
  status: number,
  errors: ErrorCase | ErrorCase[],
) => {
  const errorArray = Array.isArray(errors) ? errors : [errors];
  const examples: Record<string, any> = {};

  errorArray.forEach((err) => {
    examples[err.code] = {
      value: {
        status: 'fail',
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
      description: err.message,
    };
  });

  return ApiResponse({
    status,
    content: {
      'application/json': { examples: examples },
    },
  });
};

// 에러 응답 헬퍼
export const ApiErrorResponse = (status = 500) =>
  ApiResponse({
    status,
    description: '서버 에러',
    content: {
      'application/json': {
        example: {
          status: 'error',
          message: 'Internal Server Error',
        },
      },
    },
  });
