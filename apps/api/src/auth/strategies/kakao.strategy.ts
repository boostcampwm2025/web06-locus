import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-kakao';
import { Provider } from '@prisma/client';
import { UsersService } from '@/users/users.service';

interface KakaoProfile {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    try {
      const userInfo = this.extractKakaoProfile(profile);

      const user = await this.usersService.findOrCreateOAuthUser(
        userInfo.email,
        userInfo.name ?? null,
        userInfo.profileImageUrl ?? null,
        Provider.KAKAO,
        String(userInfo.id),
      );

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  private extractKakaoProfile(profile: Profile) {
    const kakaoProfile = profile._json as KakaoProfile;
    const { id, kakao_account: kakaoAccount } = kakaoProfile;

    const email = kakaoAccount?.email;
    const name = kakaoAccount?.profile?.nickname;
    const profileImageUrl = kakaoAccount?.profile?.profile_image_url;
    if (!email) {
      throw new UnauthorizedException('Kakao 계정에 이메일 정보가 없습니다.');
    }
    return { id, email, name, profileImageUrl };
  }
}
