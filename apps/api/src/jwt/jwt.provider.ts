import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(
    userId: bigint,
    email: string,
    provider: Provider,
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId.toString(), email, provider };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  async generateRefreshToken(userId: bigint): Promise<string> {
    const payload = { sub: userId.toString() };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 Access Token입니다');
    }
  }

  async verifyRefreshToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        { secret: this.configService.get('JWT_REFRESH_SECRET') },
      );
      return payload.sub;
    } catch {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
    }
  }
}
