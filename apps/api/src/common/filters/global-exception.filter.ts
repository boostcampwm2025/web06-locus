import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { ApiResponse } from '../utils/api-response.helper';
import { Request, Response } from 'express';
import { logException } from '../logger/exception-logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const { req, res } = this.getHttpContext(host);

    logException(exception, req);

    const { status, body } = this.toResponsePayload(exception);

    return res.status(status).json(body);
  }

  private normalizeMessage(body: unknown, fallback: string): string {
    if (typeof body === 'string') return body;

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = body.message;

      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }

    return fallback;
  }

  private getHttpContext(host: ArgumentsHost): { req: Request; res: Response } {
    const ctx = host.switchToHttp();
    return {
      req: ctx.getRequest<Request>(),
      res: ctx.getResponse<Response>(),
    };
  }

  private toResponsePayload(exception: unknown): {
    status: number;
    body: unknown;
  } {
    // BusinessException → fail
    if (exception instanceof BusinessException) {
      const status = exception.getStatus();
      return {
        status,
        body: ApiResponse.fail(
          exception.code,
          exception.message,
          exception.details,
        ),
      };
    }

    // HttpException → 4xx fail, 5xx error
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = this.normalizeMessage(response, exception.message);

      // 4xx -> fail
      if (status >= 400 && status < 500) {
        return {
          status,
          body: ApiResponse.fail('DEFAULT_CLIENT_ERROR', message),
        };
      }

      // 5xx -> error
      return {
        status,
        body: ApiResponse.error('Internal Server Error'),
      };
    }

    // Unknown/System → 500 error
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: ApiResponse.error('Internal Server Error'),
    };
  }
}
