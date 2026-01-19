import { getAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL } from './constants';
import { sentry } from '@/shared/utils/sentryWrapper';
import { handleApiErrorForSentry } from './apiErrorHandler';

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
  void sentry.addBreadcrumb({
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
  void sentry.addBreadcrumb({
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
  const responseClone = response.clone();
  const errorText = await responseClone.text();
  const status = response.status;
  const statusText = response.statusText || 'Unknown Error';

  // API 에러를 Sentry에 전송 (에러 섀도잉 방지를 위해 try-catch로 감쌈)
  try {
    await handleApiErrorForSentry(response, endpoint, url, options);
  } catch (error) {
    // Sentry 전송 실패해도 원본 에러는 반드시 던져야 함
    console.error('Sentry 에러 전송 실패:', error);
  }

  // API 요청 실패 에러 던지기
  throw new Error(
    `API 요청 실패: ${String(status)} ${statusText} - ${errorText}`,
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
