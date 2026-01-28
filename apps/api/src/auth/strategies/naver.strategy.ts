import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-oauth2';
import { Provider } from '@prisma/client';
import { UsersService } from '@/users/users.service';

const NAVER_OAUTH_CONFIG = {
  AUTHORIZATION_URL: 'https://nid.naver.com/oauth2.0/authorize',
  TOKEN_URL: 'https://nid.naver.com/oauth2.0/token',
  PROFILE_API_URL: 'https://openapi.naver.com/v1/nid/me',
} as const;

interface NaverResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email: string;
    name?: string;
    profile_image?: string;
  };
}

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      authorizationURL: NAVER_OAUTH_CONFIG.AUTHORIZATION_URL,
      tokenURL: NAVER_OAUTH_CONFIG.TOKEN_URL,
      clientID: configService.getOrThrow<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('NAVER_CALLBACK_URL'),
      scope: ['email', 'profileImage', 'name'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    _profile: any,
    done: (err?: unknown, user?: false | Express.User, info?: object) => void,
  ): Promise<void> {
    try {
      const profileData = await this.getNaverProfile(accessToken);

      const { id, email, name, profile_image } = profileData;
      this.validateEmail(email);

      const user = await this.usersService.findOrCreateOAuthUser(
        email,
        name ?? null,
        profile_image ?? null,
        Provider.NAVER,
        id,
      );

      done(null, user);
    } catch (error) {
      done(error);
    }
  }

  private async getNaverProfile(
    accessToken: string,
  ): Promise<NaverResponse['response']> {
    const response = await fetch(NAVER_OAUTH_CONFIG.PROFILE_API_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new InternalServerErrorException('네이버 API 호출에 실패했습니다.');
    }

    const data = (await response.json()) as NaverResponse;

    if (data.resultcode !== '00') {
      throw new UnauthorizedException(`네이버 인증 실패: ${data.message}`);
    }

    return data.response;
  }

  private validateEmail(email: string): void {
    if (!email) {
      throw new UnauthorizedException('네이버 계정에 이메일 정보가 없습니다.');
    }
  }
}
