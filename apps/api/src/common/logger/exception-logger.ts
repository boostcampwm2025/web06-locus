import { HttpException, Logger } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';

const logger = new Logger('Exception');

export function logException(exception: unknown, req: Request) {
  const requestInfo = `[${req.method}] ${req.url}$`;
  const status =
    exception instanceof HttpException ? exception.getStatus() : null;

  if (exception instanceof BusinessException) {
    logger.warn(
      `[BUSINESS] ${String(status)} ${exception.code} - ${exception.message} (requestInfo: ${requestInfo})`,
    );
    return;
  }

  if (exception instanceof HttpException) {
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

  logger.error(`[UNKNOWN] ${String(exception)} (requestInfo: ${requestInfo})`);
}
