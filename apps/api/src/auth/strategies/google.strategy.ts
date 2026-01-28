import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Provider } from '@prisma/client';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const userInfo = this.extractGoogleProfile(profile);

      const user = await this.usersService.findOrCreateOAuthUser(
        userInfo.email,
        userInfo.name,
        userInfo.profileImageUrl,
        Provider.GOOGLE,
        userInfo.id,
      );

      done(null, user);
    } catch (error) {
      done(error);
    }
  }

  private extractGoogleProfile(profile: Profile) {
    const { id, emails, displayName, photos } = profile;

    const email = emails?.[0]?.value;
    const name = displayName;
    const profileImageUrl = photos?.[0]?.value ?? null;

    if (!email) {
      throw new UnauthorizedException('구글 계정에 이메일 정보가 없습니다.');
    }

    return { id, email, name, profileImageUrl };
  }
}
