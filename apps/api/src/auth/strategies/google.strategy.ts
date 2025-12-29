import { Injectable } from '@nestjs/common';
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
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : '';
    const name = displayName;
    const profileImageUrl =
      photos && photos.length > 0 ? photos[0].value : null;

    try {
      const user = await this.usersService.findOrCreateOAuthUser(
        email,
        name,
        profileImageUrl,
        Provider.GOOGLE,
        id,
      );

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
