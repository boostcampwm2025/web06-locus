import { HttpException, Logger } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';
import { Request } from 'express';

const logger = new Logger('Exception');

export function logException(exception: unknown, req: Request) {
  const requestInfo = `[${req.method}] ${req.url}`;
  const status =
    exception instanceof HttpException ? exception.getStatus() : null;

  if (exception instanceof BusinessException) {
    logger.warn(
      `[BUSINESS] ${String(status)} ${exception.code} - ${exception.message} (requestInfo: ${requestInfo})`,
    );
    return;
  }

  if (exception instanceof HttpException) {
    if (status && status >= 500) {
      logger.error(
        `[HTTP] ${String(status)} ${exception.message} (requestInfo: ${requestInfo})`,
        exception.stack,
      );
      return;
    }

    logger.warn(
      `[HTTP] ${String(status)} ${exception.message} (requestInfo: ${requestInfo})`,
    );
    return;
  }

  if (exception instanceof Error) {
    logger.error(
      `[SYSTEM] ${exception.message} (requestInfo: ${requestInfo})`,
      exception.stack,
    );
    return;
  }

  logger.error(`[UNKNOWN] (requestInfo: ${requestInfo})`, exception);
  return;
}
