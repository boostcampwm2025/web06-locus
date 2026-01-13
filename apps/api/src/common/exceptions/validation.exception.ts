import { ValidationError } from 'class-validator';
import { BusinessException } from './business.exception';
import { HttpStatus } from '@nestjs/common';

export class ValidationException extends BusinessException {
  constructor(errors: ValidationError[]) {
    super(
      HttpStatus.BAD_REQUEST,
      'VALIDATION_FAILED',
      '요청 값 검증에 실패했습니다',
      mapValidationErrors(errors),
    );
  }
}

const mapValidationErrors = (errors: ValidationError[]) => {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    if (!error.constraints) continue;

    result[error.property] = Object.values(error.constraints);
  }

  return result;
};
