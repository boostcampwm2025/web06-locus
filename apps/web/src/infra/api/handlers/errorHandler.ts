import { ClientError, ServerError } from '@/shared/errors';
import { handleApiErrorForSentry } from '../apiErrorHandler';
import { parseErrorBody } from '../core/responseParser';
import type { ApiClientOptions } from '..';
import type { ApiErrorResponse } from '@/shared/errors';

function determineErrorMessage(
  status: number,
  body: ApiErrorResponse | null,
): string {
  if (body?.message) return body.message;
  return status >= 500 ? '서버 오류' : '잘못된 요청';
}

export async function handleUnauthorized(): Promise<void> {
  const { useAuthStore } = await import('@/features/auth/domain/authStore');
  useAuthStore.getState().clearAuth();
}

/**
 * 에러 처리
 */
export async function handleErrorResponse(
  response: Response,
  endpoint: string,
  url: string,
  options: ApiClientOptions,
): Promise<never> {
  const status = response.status;

  // Sentry 로깅을 위해 먼저 clone (body를 읽기 전에)
  try {
    await handleApiErrorForSentry(response, endpoint, url, options);
  } catch (err) {
    console.error('Sentry logging failed:', err);
  }

  // 에러 바디 파싱 (clone 후 또는 clone 실패 후)
  const errorBody = await parseErrorBody(response);

  const errorCode = errorBody?.code;
  const errorMessage = determineErrorMessage(status, errorBody);

  const ErrorClass = status >= 500 ? ServerError : ClientError;
  throw new ErrorClass(errorMessage, status, errorCode, errorBody ?? undefined);
}
