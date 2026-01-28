import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtProvider } from '@/jwt/jwt.provider';
import { NaverStrategy } from './strategies/naver.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { RedisModule } from '@/redis/redis.module';
import { MailService } from '@/mail/mail.service';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [JwtModule, UsersModule, RedisModule, MailModule],
  providers: [
    AuthService,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    JwtProvider,
    MailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
