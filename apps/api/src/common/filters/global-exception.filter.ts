import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { ApiResponse } from '../utils/api-response.helper';
import { Response } from 'express';
import { logException } from '../logger/exception-logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();

    logException(exception, req);

    if (exception instanceof BusinessException) {
      const status = exception.getStatus();

      return res
        .status(status)
        .json(
          ApiResponse.fail(
            exception.code,
            exception.message,
            exception.details,
          ),
        );
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      const message = normalizeMessage(body, exception.message);
      if (status >= 400 && status < 500) {
        return res
          .status(status)
          .json(ApiResponse.fail('DEFAULT_CLIENT_ERROR', message));
      }

      return res
        .status(status)
        .json(ApiResponse.error('Internal Server Error', message));
    }

    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.error('Internal Server Error'));
  }
}

function normalizeMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string') return body;

  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  return fallback;
}
