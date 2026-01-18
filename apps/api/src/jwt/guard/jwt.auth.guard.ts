import { Request } from 'express';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtProvider } from '../jwt.provider';
import { RedisService } from '@/redis/redis.service';
import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';
import { InvalidAccessTokenException } from '@/auth/exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtProvider: JwtProvider,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new InvalidAccessTokenException();

    await this.checkTokenInBlackList(token);

    try {
      const payload = await this.jwtProvider.verifyAccessToken(token);
      request.user = payload;
    } catch {
      throw new InvalidAccessTokenException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async checkTokenInBlackList(token: string) {
    const isBlacklisted = await this.redisService.isExists(
      `${REDIS_KEY_PREFIX.BLACKLIST}${token}`,
    );

    if (isBlacklisted) throw new InvalidAccessTokenException();
  }
}
