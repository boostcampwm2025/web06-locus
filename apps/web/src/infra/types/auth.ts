/**
 * 인증 관련 API 타입 정의
 */

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface SignupVerifyRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success';
  data: {
    accessToken: string;
  };
}

export interface ApiErrorResponse {
  status: 'fail' | 'error';
  code: string;
  message: string;
}

export class AuthError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}
