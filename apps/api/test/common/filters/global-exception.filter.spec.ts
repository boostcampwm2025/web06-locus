import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { BusinessException } from '@/common/exceptions/business.exception';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  // Express Response mock
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  // ArgumentsHost mock
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jest.clearAllMocks();
  });

  it('커스텀 비즈니스 예외는 fail로 응답한다', () => {
    // 커스텀 비즈니스 예외 정의
    class UserNotFoundException extends BusinessException {
      constructor(userId: string) {
        super(404, 'USER_NOT_FOUND', '유저 없음', { userId });
      }
    }
    const ex = new UserNotFoundException('1');

    filter.catch(ex, host);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      data: {
        code: 'USER_NOT_FOUND',
        message: '유저 없음',
        details: { userId: '1' },
      },
    });
  });

  it('기본 HttpException 4xx는 fail로 응답한다 (message가 string인 경우)', () => {
    const ex = new HttpException('Cannot GET /ok', 404);

    filter.catch(ex, host);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      data: {
        code: 'DEFAULT_CLIENT_ERROR',
        message: 'Cannot GET /ok',
        details: undefined,
      },
    });
  });

  it('기본 HttpException 4xx는 fail로 응답한다 (message가 배열인 경우)', () => {
    // ValidationPipe가 이런 형태로 던지는 케이스를 모사
    const ex = new BadRequestException({
      message: ['name must be a string', 'age must be a number'],
    });

    filter.catch(ex, host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      data: {
        code: 'DEFAULT_CLIENT_ERROR',
        message: 'name must be a string, age must be a number',
        details: undefined,
      },
    });
  });

  it('기본 HttpException 5xx는 error로 응답한다 (code에 normalize된 message가 들어간다)', () => {
    // body가 객체이고 message가 string인 형태
    const ex = new HttpException({ message: 'DB down' }, 503);

    filter.catch(ex, host);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal Server Error',
      code: 'DB down',
      data: undefined,
    });
  });

  it('시스템 예외는 500 error로 응답한다', () => {
    const ex = new Error('boom');

    filter.catch(ex, host);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal Server Error',
      code: undefined,
      data: undefined,
    });
  });
});
