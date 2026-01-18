import { getAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL } from './constants';
import * as Sentry from '@sentry/react';

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const { requireAuth = true, headers = {}, ...restOptions } = options;

  // FormData인 경우 Content-Type을 자동으로 설정하지 않음 (브라우저가 boundary 포함하여 설정)
  const isFormData = restOptions.body instanceof FormData;
  const requestHeaders = prepareHeaders(headers, requireAuth, isFormData);
  const url = buildApiUrl(endpoint);
  const method = options.method ?? 'GET';
  const startTime = Date.now();

  // API 요청 Breadcrumb 추가
  Sentry.addBreadcrumb({
    category: 'api',
    message: `API ${method} ${endpoint}`,
    level: 'info',
    data: {
      url,
      method,
    },
  });

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  const duration = Date.now() - startTime;

  // API 응답 Breadcrumb 추가
  Sentry.addBreadcrumb({
    category: 'api',
    message: `API ${method} ${endpoint} - ${response.status}`,
    level: response.ok ? 'info' : 'error',
    data: {
      status: response.status,
      duration,
    },
  });

  if (response.status === 401) {
    await handleUnauthorized();
  }

  if (!response.ok) {
    await handleErrorResponse(response, endpoint, url, options);
  }

  return parseResponse<T>(response);
};

/**
 * Headers를 Record<string, string>로 변환
 * @param headers - HeadersInit
 * @returns Record<string, string>
 */
function normalizeHeaders(headers: HeadersInit): Record<string, string> {
  const result: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
  } else {
    Object.assign(result, headers);
  }

  return result;
}

/**
 * 요청 헤더 준비 (기본 헤더 + 사용자 헤더 + 인증 헤더)
 * @param headers - HeadersInit
 * @param requireAuth - 인증 필요 여부
 * @param isFormData - FormData 여부 (FormData인 경우 Content-Type 자동 설정 안 함)
 * @returns Record<string, string>
 */
function prepareHeaders(
  headers: HeadersInit,
  requireAuth: boolean,
  isFormData = false,
): Record<string, string> {
  const requestHeaders: Record<string, string> = {
    ...normalizeHeaders(headers),
  };

  // FormData가 아닌 경우에만 Content-Type 설정
  if (!isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  return requestHeaders;
}

/**
 * API URL 생성
 * @param endpoint - API 엔드포인트
 * @param absolute - 절대 URL로 반환할지 여부 (기본값: false, 상대 경로)
 * @returns 완전한 API URL
 */
export function buildApiUrl(endpoint: string, absolute = false): string {
  // 이미 절대 URL인 경우 그대로 반환
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  // 상대 경로로 API_BASE_URL prefix 추가
  const relativeUrl = `${API_BASE_URL}${endpoint}`;

  // 절대 URL이 필요한 경우 (예: window.location.href)
  return absolute ? `${window.location.origin}${relativeUrl}` : relativeUrl;
}

async function handleUnauthorized(): Promise<void> {
  const { useAuthStore } = await import('@/features/auth/domain/authStore');
  useAuthStore.getState().clearAuth();
}

async function handleErrorResponse(
  response: Response,
  endpoint: string,
  url: string,
  options: ApiClientOptions,
): Promise<never> {
  // response를 복제해서 텍스트를 추출 (원본 response는 그대로 유지)
  const responseClone = response.clone();
  const errorText = await responseClone.text();
  const statusText = response.statusText || 'Unknown Error';

  // 401 에러는 조건부로만 Sentry 전송
  if (response.status === 401) {
    const accessToken = getAccessToken();
    const requireAuth = options.requireAuth !== false;

    // 비정상적인 401만 전송
    // - 토큰이 있는데도 401 발생
    // - 인증이 필요한 요청인데 401 발생
    if (accessToken && requireAuth) {
      Sentry.captureException(new Error('유효한 토큰이 있는데도 401 발생'), {
        tags: {
          error_type: 'api_error',
          http_status: 401,
          endpoint: endpoint,
          auth_status: 'has_token',
        },
        extra: {
          status_text: statusText,
          response_body: errorText.substring(0, 1000),
          request_url: url,
          request_method: options.method ?? 'GET',
        },
        level: 'warning',
      });
    }
    // 정상적인 401은 Sentry 전송 안 함 (로그인 안 한 사용자 등)
  } else {
    // 401이 아닌 다른 에러는 모두 전송
    Sentry.captureException(new Error(`API ${response.status}`), {
      tags: {
        error_type: 'api_error',
        http_status: response.status,
        endpoint: endpoint,
      },
      extra: {
        status_text: statusText,
        response_body: errorText.substring(0, 1000), // 너무 긴 응답은 잘라내기
        request_url: url,
        request_method: options.method ?? 'GET',
      },
    });
  }

  throw new Error(
    `API 요청 실패: ${String(response.status)} ${statusText} - ${errorText}`,
  );
}

/**
 * 응답 파싱
 * json 형태가 아닌 경우 text 형태로 처리하도록 한다
 * @param response - Response
 * @returns T
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return (await response.text()) as T;
  }
  return (await response.json()) as T;
}
