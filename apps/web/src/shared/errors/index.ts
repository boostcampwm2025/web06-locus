/**
 * API 에러 클래스 정의
 * 4xx: ClientError (토스트로 표시)
 * 5xx: ServerError (에러 폴백으로 표시)
 */

/**
 * 백엔드 API 에러 응답 타입
 * ApiResponseFail: 4xx 에러 (status: 'fail', code 필수, message, details 선택)
 * ApiResponseError: 5xx 에러 (status: 'error', message 필수, code, details 선택)
 */
export type ApiErrorResponse =
  | {
      status: 'fail';
      code: string;
      message?: string;
      details?: unknown;
    }
  | {
      status: 'error';
      message: string;
      code?: string;
      details?: unknown;
    };

/**
 * 클라이언트 에러 (4xx)
 * 사용자 입력 오류 등으로 토스트로 표시
 */
export class ClientError extends Error {
  status: number;
  code?: string;
  response?: ApiErrorResponse;

  constructor(
    message: string,
    status: number,
    code?: string,
    response?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ClientError';
    this.status = status;
    this.code = code;
    this.response = response;
  }
}

/**
 * 서버 에러 (5xx)
 * 서버 문제로 에러 폴백으로 표시
 */
export class ServerError extends Error {
  status: number;
  code?: string;
  response?: ApiErrorResponse;

  constructor(
    message: string,
    status: number,
    code?: string,
    response?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
    this.code = code;
    this.response = response;
  }
}

/**
 * 에러가 ServerError인지 확인
 */
export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

/**
 * 에러가 ClientError인지 확인
 */
export function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError;
}

/**
 * 인증 에러
 * 토큰 재발급 실패 등 인증 관련 에러로, 사용자에게 토스트를 표시하지 않음
 * (자동 로그아웃 처리됨)
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * 에러가 AuthError인지 확인
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * 네트워크 오류 여부 (Failed to fetch, 오프라인 등)
 * 토스트에서 "네트워크가 불안정합니다." 등으로 대체 표시할 때 사용
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch')
    return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg === 'failed to fetch' ||
      msg.includes('network request failed') ||
      msg.includes('networkerror')
    );
  }
  return false;
}

/**
 * Presigned URL 생성 실패 에러
 */
export class PresignedUrlGenerationError extends Error {
  originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'PresignedUrlGenerationError';
    this.originalError = originalError;
  }
}

/**
 * 이미지 업로드 실패 에러
 */
export class ImageUploadError extends Error {
  fileName?: string;
  originalError?: unknown;

  constructor(message: string, fileName?: string, originalError?: unknown) {
    super(message);
    this.name = 'ImageUploadError';
    this.fileName = fileName;
    this.originalError = originalError;
  }
}

/**
 * Presigned 방식 기록 생성 실패 에러
 */
export class RecordCreationError extends Error {
  originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'RecordCreationError';
    this.originalError = originalError;
  }
}

/**
 * 에러가 PresignedUrlGenerationError인지 확인
 */
export function isPresignedUrlGenerationError(
  error: unknown,
): error is PresignedUrlGenerationError {
  return error instanceof PresignedUrlGenerationError;
}

/**
 * 에러가 ImageUploadError인지 확인
 */
export function isImageUploadError(error: unknown): error is ImageUploadError {
  return error instanceof ImageUploadError;
}

/**
 * 에러가 RecordCreationError인지 확인
 */
export function isRecordCreationError(
  error: unknown,
): error is RecordCreationError {
  return error instanceof RecordCreationError;
}
