import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { NaverAuthGuard } from './guards/naver-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('oauth2/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Guard가 Google 로그인 페이지로 리다이렉트
  }

  @Get('oauth2/naver')
  @UseGuards(NaverAuthGuard)
  async naverLogin() {
    // Guard가 Naver 로그인 페이지로 리다이렉트
  }

  @Get('oauth2/callback/google')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  @Get('oauth2/callback/naver')
  @UseGuards(NaverAuthGuard)
  async naverCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  // TODO: POST /auth/reissue

  private async handleOAuthCallback(req: Request, res: Response) {
    const user = req.user as User;

    const tokens = await this.authService.generateTokens(user);

    const redirectUrl = this.buildRedirectUrl(
      tokens.accessToken,
      tokens.refreshToken,
    );

    res.redirect(redirectUrl);
  }

  private buildRedirectUrl(accessToken: string, refreshToken: string): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  }
}
