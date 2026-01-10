import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { NaverAuthGuard } from './guards/naver-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { VerifyEmailRequest } from './dto/verify-email-request.dto';
import { LoginRequest } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_MAX_AGE: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const rawValue = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN');
    const days = parseInt(rawValue ?? '7', 10);
    const validDays = isNaN(days) ? 7 : days;
    this.REFRESH_TOKEN_MAX_AGE = validDays * 24 * 60 * 60 * 1000;
  }

  @Post('signup')
  async signup(@Body() signupRequest: SignUpRequest): Promise<void> {
    await this.authService.signup(signupRequest);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailRequest: VerifyEmailRequest) {
    await this.authService.verifyEmail(verifyEmailRequest);
  }

  @Post('login')
  async login(
    @Body() loginRequest: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginRequest);

    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

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

  @Get('oauth2/kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoLogin() {
    // Guard가 Kakao 로그인 페이지로 리다이렉트
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

  @Get('oauth2/callback/kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  // TODO: POST /auth/reissue

  private async handleOAuthCallback(req: Request, res: Response) {
    const user = req.user as User;

    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    this.setRefreshTokenCookie(res, refreshToken);

    const redirectUrl = this.buildRedirectUrl(accessToken);

    res.redirect(redirectUrl);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    // Refresh Token을 HttpOnly 쿠키에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경(HTTPS)에서만 전송
      sameSite: 'lax', // CSRF 방지
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
      path: '/auth/reissue', // 오직 재발급 경로에서만 전송
    });
  }

  private buildRedirectUrl(accessToken: string): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return `${frontendUrl}/auth/callback?accessToken=${accessToken}`;
  }
}
