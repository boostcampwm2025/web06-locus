import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { SignUpRequest } from '../dto/sign-up-request.dto';
import { VerifyEmailRequest } from '../dto/verify-email-request.dto';
import { LoginRequest } from '../dto/login-request.dto';
import {
  ApiErrorResponse,
  ApiFailResponse,
  ApiSuccessResponse,
} from '@/common/utils/swagger-response.helper';
import { AuthErrorCode } from '../exception/auth.error-code';
import { TokenResponse } from '../dto/auth-response.dto';

export const RequestSignupSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원가입 요청',
      description: '이메일 인증 코드를 발송합니다.',
    }),
    ApiBody({ type: SignUpRequest }),
    ApiResponse({
      status: 200,
      description: '인증 코드 발송 성공',
      schema: {
        properties: { status: { type: 'string', example: 'success' } },
      },
    }),
    ApiFailResponse(400, {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: '요청 값 검증 실패',
      details: {
        email: ['올바른 이메일 형식이 아닙니다.'],
        password: ['비밀번호는 최소 8자 이상이어야 합니다.'],
      },
    }),
    ApiFailResponse(409, [
      {
        code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
        message: '이미 존재하는 이메일입니다',
      },
      {
        code: AuthErrorCode.EMAIL_ALREADY_SENT,
        message: '이미 인증 코드가 발송되었습니다',
      },
    ]),
    ApiErrorResponse(),
  );

export const SignupVerifySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원가입 완료',
      description: '이메일 인증 코드를 확인하고 회원가입을 완료합니다.',
    }),
    ApiBody({ type: VerifyEmailRequest }),
    ApiResponse({
      status: 201,
      description: '회원가입 완료',
      schema: {
        properties: { status: { type: 'string', example: 'success' } },
      },
    }),
    ApiFailResponse(400, [
      {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: '요청 값 검증에 실패했습니다',
        details: {
          email: ['code must be a string'],
          password: ['인증코드는 6자입니다.'],
        },
      },
      {
        code: AuthErrorCode.EMAIL_VERIFICATION_FAILED,
        message: '인증 코드가 일치하지 않습니다 1',
      },
      {
        code: AuthErrorCode.EMAIL_VERIFICATION_EXPIRED,
        message: '인증 코드가 만료되었습니다',
      },
    ]),
    ApiFailResponse(429, {
      code: AuthErrorCode.EMAIL_VERIFICATION_TOO_MANY_TRIES,
      message: '인증 시도 횟수를 초과했습니다',
    }),
    ApiErrorResponse(),
  );

export const LoginSwagger = () =>
  applyDecorators(
    ApiExtraModels(TokenResponse),
    ApiOperation({
      summary: '로그인',
      description:
        '이메일과 비밀번호로 로그인합니다. Refresh Token은 HttpOnly 쿠키로 자동 설정됩니다.',
    }),
    ApiBody({ type: LoginRequest }),
    ApiSuccessResponse(TokenResponse),
    ApiFailResponse(400, [
      {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: '요청 값 검증 실패했습니다',
        details: {
          email: ['email must be an email'],
          password: ['password should not be empty'],
        },
      },
      {
        code: AuthErrorCode.SOCIAL_ACCOUNT_LOGIN,
        message: '소셜 로그인으로 가입된 계정입니다',
        details: { provider: 'GOOGLE' },
      },
    ]),
    ApiFailResponse(401, {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: '이메일 또는 비밀번호가 올바르지 않습니다',
    }),
    ApiErrorResponse(),
  );

export const GoogleLoginSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Google OAuth 로그인',
      description: 'Google 로그인 페이지로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: 'Google 로그인 페이지로 리다이렉트',
    }),
  );

export const NaverLoginSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Naver OAuth 로그인',
      description: 'Naver 로그인 페이지로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: 'Naver 로그인 페이지로 리다이렉트',
    }),
  );

export const KakaoLoginSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Kakao OAuth 로그인',
      description: 'Kakao 로그인 페이지로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: 'Kakao 로그인 페이지로 리다이렉트',
    }),
  );

export const GoogleCallbackSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Google OAuth 콜백',
      description:
        'Google 로그인 후 콜백을 처리하고 프론트엔드로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: '프론트엔드로 리다이렉트 (accessToken 포함)',
    }),
    ApiFailResponse(401, {
      code: 'OAUTH_AUTHENTICATION_FAILED',
      message: 'OAuth 인증에 실패했습니다',
    }),
  );

export const NaverCallbackSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Naver OAuth 콜백',
      description:
        'Naver 로그인 후 콜백을 처리하고 프론트엔드로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: '프론트엔드로 리다이렉트 (accessToken 포함)',
    }),
    ApiFailResponse(401, {
      code: 'OAUTH_AUTHENTICATION_FAILED',
      message: 'OAuth 인증에 실패했습니다',
    }),
  );

export const KakaoCallbackSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Kakao OAuth 콜백',
      description:
        'Kakao 로그인 후 콜백을 처리하고 프론트엔드로 리다이렉트합니다.',
    }),
    ApiResponse({
      status: 302,
      description: '프론트엔드로 리다이렉트 (accessToken 포함)',
    }),
    ApiFailResponse(401, {
      code: 'OAUTH_AUTHENTICATION_FAILED',
      message: 'OAuth 인증에 실패했습니다',
    }),
  );

// TODO: 토큰 재발급
