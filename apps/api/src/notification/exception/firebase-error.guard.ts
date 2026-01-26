import { FirebaseError } from 'firebase-admin';
import { FCM_ERROR_CODES } from './notification-error-code';

export const isFirebaseError = (error: unknown): error is FirebaseError => {
  if (!(error instanceof Error)) return false;
  if (!('code' in error)) return false;

  const errorWithCode = error as { code: unknown };
  return (
    typeof errorWithCode.code === 'string' &&
    errorWithCode.code.startsWith('messaging/')
  );
};

export const isTokenExpiredError = (error: unknown): boolean => {
  if (!isFirebaseError(error)) return false;

  return (
    error.code === FCM_ERROR_CODES.INVALID_REGISTRATION_TOKEN ||
    error.code === FCM_ERROR_CODES.REGISTRATION_TOKEN_NOT_REGISTERED
  );
};

export const isRetryableError = (error: unknown): boolean => {
  if (!isFirebaseError(error)) return false;

  return (
    error.code === FCM_ERROR_CODES.INTERNAL_ERROR ||
    error.code === FCM_ERROR_CODES.SERVER_UNAVAILABLE ||
    error.code === FCM_ERROR_CODES.MESSAGE_RATE_EXCEEDED
  );
};

export function formatFirebaseError(error: unknown): string {
  if (!isFirebaseError(error)) {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  const errorMessages: Record<string, string> = {
    [FCM_ERROR_CODES.INVALID_REGISTRATION_TOKEN]:
      '유효하지 않은 FCM 토큰입니다.',
    [FCM_ERROR_CODES.REGISTRATION_TOKEN_NOT_REGISTERED]:
      '등록되지 않은 FCM 토큰입니다.',
    [FCM_ERROR_CODES.INVALID_ARGUMENT]: '잘못된 인자입니다.',
    [FCM_ERROR_CODES.INVALID_RECIPIENT]: '잘못된 수신자입니다.',
    [FCM_ERROR_CODES.INVALID_PAYLOAD]: '잘못된 메시지 페이로드입니다.',
    [FCM_ERROR_CODES.MESSAGE_RATE_EXCEEDED]:
      '메시지 전송 속도 제한을 초과했습니다.',
    [FCM_ERROR_CODES.INTERNAL_ERROR]: 'FCM 내부 오류가 발생했습니다.',
    [FCM_ERROR_CODES.SERVER_UNAVAILABLE]: 'FCM 서버를 사용할 수 없습니다.',
  };

  return errorMessages[error.code] || `FCM 오류: ${error.message}`;
}
