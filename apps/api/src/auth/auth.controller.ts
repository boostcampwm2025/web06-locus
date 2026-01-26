import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  GoogleCallbackSwagger,
  GoogleLoginSwagger,
  KakaoCallbackSwagger,
  KakaoLoginSwagger,
  LoginSwagger,
  LogoutSwagger,
  NaverCallbackSwagger,
  NaverLoginSwagger,
  ReissueTokenSwagger,
  RequestSignupSwagger,
  SignupVerifySwagger,
} from './swagger/auth.swagger';
import { TokenResponse } from './dto/auth-response.dto';
import { InvalidRefreshTokenException } from './exception';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { AccessToken } from '@/common/decorators/access-token.decorator';

@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_MAX_AGE: number;
  private readonly IS_PRODUCTION: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.IS_PRODUCTION = this.configService.get('NODE_ENV') === 'production';
    const rawValue = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN');
    const days = parseInt(rawValue ?? '7', 10);
    const validDays = isNaN(days) ? 7 : days;
    this.REFRESH_TOKEN_MAX_AGE = validDays * 24 * 60 * 60 * 1000;
  }

  @Post('signup/request')
  @HttpCode(HttpStatus.OK)
  @RequestSignupSwagger()
  async requestSignup(@Body() signupRequest: SignUpRequest): Promise<void> {
    await this.authService.requestSignup(signupRequest);
  }

  @Post('signup/confirm')
  @SignupVerifySwagger()
  async signupVerify(@Body() verifyEmailRequest: VerifyEmailRequest) {
    await this.authService.completeSignup(verifyEmailRequest);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  async login(
    @Body() loginRequest: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginRequest);

    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('reissue')
  @HttpCode(HttpStatus.OK)
  @ReissueTokenSwagger()
  async reissue(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const refreshToken = (req.cookies as Record<string, string | undefined>)
      .refreshToken;
    if (!refreshToken) throw new InvalidRefreshTokenException();

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.reissueTokens(refreshToken);

    this.setRefreshTokenCookie(res, newRefreshToken);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @LogoutSwagger()
  async logout(
    @CurrentUser('sub') userId: bigint,
    @AccessToken() token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(userId, token);
    this.clearRefreshTokenCookie(res);
  }

  @Get('oauth2/google')
  @UseGuards(GoogleAuthGuard)
  @GoogleLoginSwagger()
  async googleLogin() {
    // Guard가 Google 로그인 페이지로 리다이렉트
  }

  @Get('oauth2/naver')
  @UseGuards(NaverAuthGuard)
  @NaverLoginSwagger()
  async naverLogin() {
    // Guard가 Naver 로그인 페이지로 리다이렉트
  }

  @Get('oauth2/kakao')
  @UseGuards(KakaoAuthGuard)
  @KakaoLoginSwagger()
  async kakaoLogin() {
    // Guard가 Kakao 로그인 페이지로 리다이렉트
  }

  @Get('oauth2/callback/google')
  @UseGuards(GoogleAuthGuard)
  @GoogleCallbackSwagger()
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  @Get('oauth2/callback/naver')
  @UseGuards(NaverAuthGuard)
  @NaverCallbackSwagger()
  async naverCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  @Get('oauth2/callback/kakao')
  @UseGuards(KakaoAuthGuard)
  @KakaoCallbackSwagger()
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

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
      sameSite: 'lax',
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
      path: '/', // 모든 경로에서 쿠키 전송 (API 요청 시 포함되도록)
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경(HTTPS)에서만 전송
      sameSite: 'lax',
      path: '/',
    });
  }

  private buildRedirectUrl(accessToken: string): string {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return `${frontendUrl}/auth/callback?accessToken=${accessToken}`;
  }
}
