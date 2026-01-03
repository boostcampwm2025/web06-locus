import { Request } from 'express';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtProvider } from '../jwt.provider';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtProvider: JwtProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다');
    }

    try {
      const payload = await this.jwtProvider.verifyAccessToken(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
