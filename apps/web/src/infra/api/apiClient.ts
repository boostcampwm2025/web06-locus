import { getAccessToken, setAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import { logger } from '@/shared/utils/logger';
import { handleApiErrorForSentry } from './apiErrorHandler';
import {
  ClientError,
  ServerError,
  type ApiErrorResponse,
} from '@/shared/errors';

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
}

// 리프레시 토큰 재발급 중인지 추적 (무한 루프 방지)
let isRefreshing = false;
// 재발급 대기 중인 요청들
const failedQueue: {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  url: string;
  options: RequestInit;
}[] = [];

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

/**
 * 401 발생 시 토큰 재발급 및 요청 재시도를 제어하는 하위 함수
 */
async function handleTokenRefreshFlow<T>(
  url: string,
  options: RequestInit,
  currentHeaders: Record<string, string>,
  endpoint: string,
  apiOptions: ApiClientOptions,
): Promise<T> {
  // 이미 재발급 중이면 대기 큐로
  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      failedQueue.push({
        resolve: (value) => resolve(value as T),
        reject,
        url,
        options: { ...options, headers: currentHeaders },
      });
    });
  }

  isRefreshing = true;

  try {
    const newAccessToken = await executeRefresh();

    // 대기 중인 요청들 재시도 (비동기)
    void retryFailedRequests(newAccessToken);

    // 현재 실패했던 요청 재시도
    const retryHeaders = {
      ...currentHeaders,
      Authorization: `Bearer ${newAccessToken}`,
    };
    const retryResponse = await fetch(url, {
      ...options,
      headers: retryHeaders,
    });

    if (retryResponse.ok) {
      return await parseResponse<T>(retryResponse);
    }

    // 재시도도 실패하면 에러 처리
    return await handleErrorResponse(retryResponse, endpoint, url, apiOptions);
  } catch (error) {
    await handleUnauthorized(); // 스토어 비우기
    throw error;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 리프레시 토큰 재발급 API 호출 본체
 */
async function executeRefresh(): Promise<string> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH_REISSUE), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('토큰 재발급 실패');
  }

  const data = (await response.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

/**
 * 재발급 대기 중인 요청들을 재시도
 */
async function retryFailedRequests(newAccessToken: string): Promise<void> {
  const queue = [...failedQueue];
  failedQueue.length = 0; // 큐 비우기

  await Promise.allSettled(
    queue.map(async ({ url, options, resolve, reject }) => {
      try {
        // 새로운 accessToken으로 헤더 업데이트
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${newAccessToken}`);

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.ok) {
          const data = await parseResponse(response);
          resolve(data);
        } else {
          reject(new Error(`Request failed with status ${response.status}`));
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Request failed'));
      }
    }),
  );
}

/**
 * API 요청 로깅 (개발 환경에서만 콘솔 출력)
 */
function trackApiBreadcrumb(method: string, endpoint: string, url: string) {
  if (import.meta.env.MODE === 'development') {
    console.info(`[API] ${method} ${endpoint}`, { url, method });
  }
}

/**
 * API 응답 로깅
 * - 성공 응답: 개발 환경에서만 콘솔 출력
 * - 실패 응답: Sentry breadcrumb 추가 (에러 추적 시 컨텍스트 제공)
 */
function trackResponseBreadcrumb(
  method: string,
  endpoint: string,
  status: number,
  duration: number,
) {
  const isSuccess = status >= 200 && status < 300;

  if (isSuccess) {
    // 성공 응답은 개발 환경에서만 콘솔 출력 (Sentry 등록 안 함)
    if (import.meta.env.MODE === 'development') {
      console.info(`[API] ${method} ${endpoint} - ${status}`, {
        status,
        duration,
      });
    }
  } else {
    // 실패 응답만 Sentry breadcrumb 추가
    logger.info(`API ${method} ${endpoint} - ${status}`, {
      status,
      duration,
    });
  }
}

/**
 * 헤더 준비
 */
function prepareHeaders(
  headers: HeadersInit,
  requireAuth: boolean,
  body: RequestInit['body'],
  method: string,
): Record<string, string> {
  const normalized = normalizeHeaders(headers);

  const isFormData = body instanceof FormData;
  const isSafeMethod = ['GET', 'HEAD'].includes(method);
  const hasBody = body !== undefined && body !== null;

  if (hasBody && !isFormData && !isSafeMethod && !normalized['Content-Type']) {
    normalized['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      normalized.Authorization = `Bearer ${accessToken}`;
    }
  }

  return normalized;
}

/**
 * 헤더 노멀라이즈
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
    // Record 형식을 안전하게 복사
    Object.entries(headers).forEach(([key, value]) => {
      result[key] = value;
    });
  }
  return result;
}

export function buildApiUrl(endpoint: string, absolute = false): string {
  if (endpoint.startsWith('http')) return endpoint;

  const baseUrl = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${API_BASE_URL}`;

  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  return absolute
    ? fullUrl
    : fullUrl.replace(
        typeof window !== 'undefined' ? window.location.origin : '',
        '',
      );
}

async function handleUnauthorized(): Promise<void> {
  const { useAuthStore } = await import('@/features/auth/domain/authStore');
  useAuthStore.getState().clearAuth();
}

/**
 * 에러 처리
 */
async function handleErrorResponse(
  response: Response,
  endpoint: string,
  url: string,
  options: ApiClientOptions,
): Promise<never> {
  const status = response.status;
  const errorBody = await parseErrorBody(response);

  try {
    await handleApiErrorForSentry(response, endpoint, url, options);
  } catch (err) {
    console.error('Sentry logging failed:', err);
  }

  const errorCode = errorBody?.code;
  const errorMessage = determineErrorMessage(status, errorBody);

  const ErrorClass = status >= 500 ? ServerError : ClientError;
  throw new ErrorClass(errorMessage, status, errorCode, errorBody ?? undefined);
}

/**
 * 에러 바디 파싱
 */
async function parseErrorBody(
  response: Response,
): Promise<ApiErrorResponse | null> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null;

  try {
    // unknown으로 먼저 받고, 타입 가드로 검증.
    const data = (await response.json()) as unknown;
    if (isValidApiErrorResponse(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function isValidApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && 'status' in value;
}

function determineErrorMessage(
  status: number,
  body: ApiErrorResponse | null,
): string {
  if (body?.message) return body.message;
  return status >= 500 ? '서버 오류' : '잘못된 요청';
}

/**
 * 응답 파싱 (Unsafe Return 해결)
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (response.status === 204) return {} as T;

  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    return text as unknown as T; // 단계적 캐스팅으로 unsafe return 방지
  }

  const json = (await response.json()) as unknown;
  return json as T; // unknown에서 T로 단언
}
