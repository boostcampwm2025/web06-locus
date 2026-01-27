import { buildApiUrl } from './core/buildUrl';
import { prepareHeaders } from './core/prepareHeaders';
import { parseResponse } from './core/responseParser';
import { trackApiBreadcrumb, trackResponseBreadcrumb } from './utils/apiLogger';
import { handleErrorResponse } from './handlers/errorHandler';
import { handleTokenRefreshFlow } from './auth/tokenRefresh';

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API 클라이언트
 * @param endpoint - API 엔드포인트
 * @param options - API 옵션
 * @returns API 응답
 */
export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const { requireAuth = true, headers = {}, ...restOptions } = options;
  const method = (options.method ?? 'GET').toUpperCase();
  const url = buildApiUrl(endpoint);

  const requestHeaders = prepareHeaders(
    headers,
    requireAuth,
    restOptions.body,
    method,
  );
  const startTime = Date.now();

  trackApiBreadcrumb(method, endpoint, url);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      credentials: 'include', // 쿠키 전송/수신을 위해 필수
    });

    trackResponseBreadcrumb(
      method,
      endpoint,
      response.status,
      Date.now() - startTime,
    );

    // 1. 401 Unauthorized 처리 (리프레시 로직)
    if (response.status === 401 && requireAuth) {
      return await handleTokenRefreshFlow<T>(
        url,
        restOptions,
        requestHeaders,
        endpoint,
        options,
      );
    }

    // 2. 기타 에러 처리
    if (!response.ok) {
      return await handleErrorResponse(response, endpoint, url, options);
    }

    // 3. 성공 응답 파싱
    return await parseResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {} as T;
    }
    throw error;
  }
};

// 자주 사용하는 함수 re-export
export { buildApiUrl } from './core/buildUrl';
export { executeRefresh } from './auth/tokenRefresh';
