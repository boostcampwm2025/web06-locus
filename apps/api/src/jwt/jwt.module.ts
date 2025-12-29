import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtProvider } from './jwt.provider';

@Module({
  imports: [NestJwtModule],
  providers: [JwtProvider],
  exports: [JwtProvider],
})
export class JwtModule {}
