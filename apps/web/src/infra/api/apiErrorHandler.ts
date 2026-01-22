import { getAccessToken } from '../storage/tokenStorage';
import { sentry } from '@/shared/utils/sentryWrapper';
import type { ApiClientOptions } from './apiClient';

/** 전송 정책 결과 타입 */
interface SentryPolicy {
  shouldSend: boolean;
  level: 'info' | 'warning' | 'error' | 'fatal';
  message: string;
}

/**
 * 에러 상태 코드에 따른 전송 정책 결정 (순수 함수로 분리)
 */
function getSentryPolicy(
  status: number,
  endpoint: string,
  options: ApiClientOptions,
): SentryPolicy {
  const defaultPolicy: SentryPolicy = {
    shouldSend: false,
    level: 'error',
    message: `API Error ${status}: ${endpoint}`,
  };

  // 1. 서버 에러 (500+)
  if (status >= 500) {
    return {
      shouldSend: true,
      level: 'fatal',
      message: `Server Error ${status}: ${endpoint}`,
    };
  }

  // 2. 인증 에러 (401)
  if (status === 401) {
    const hasToken = !!getAccessToken();
    const isAuthRequired = options.requireAuth !== false;
    return {
      shouldSend: hasToken && isAuthRequired,
      level: 'warning',
      message: '유효한 토큰이 있는데도 401 발생',
    };
  }

  // 3. 잘못된 요청 (400)
  if (status === 400) {
    return {
      shouldSend: true,
      level: 'warning',
      message: `Bad Request (API Spec Mismatch?): ${endpoint}`,
    };
  }

  // 4. 경로 없음 (404)
  if (status === 404 && endpoint.startsWith('/api')) {
    return {
      shouldSend: true,
      level: 'info',
      message: `API Endpoint Not Found: ${endpoint}`,
    };
  }

  // 그 외 (403, 409, 422 등)
  return defaultPolicy;
}

/**
 * 최종 핸들러
 */
export async function handleApiErrorForSentry(
  response: Response,
  endpoint: string,
  url: string,
  options: ApiClientOptions,
): Promise<void> {
  const { shouldSend, level, message } = getSentryPolicy(
    response.status,
    endpoint,
    options,
  );

  if (!shouldSend) return;

  // Response body가 이미 사용되었을 수 있으므로 clone 시도
  let responseClone: Response;

  try {
    responseClone = response.clone();
  } catch {
    return;
  }
  const errorText = await responseClone.text();

  void sentry.captureException(new Error(message), {
    level,
    tags: {
      error_type: 'api_error',
      http_status: response.status,
      endpoint,
      method: options.method ?? 'GET',
    },
    extra: {
      status_text: response.statusText || 'Unknown Error',
      request_url: url,
      response_body: errorText.substring(0, 500),
    },
  });
}
