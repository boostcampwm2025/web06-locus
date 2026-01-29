import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PwaException } from '../exceptions/pwa.exception';

@Injectable()
export class PwaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    // PWA 커스텀 헤더 확인
    const isPwaEnv =
      headers['x-requested-with'] === 'PWA' ||
      headers['x-display-mode'] === 'standalone';

    if (!isPwaEnv) throw new PwaException();

    return true;
  }
}
