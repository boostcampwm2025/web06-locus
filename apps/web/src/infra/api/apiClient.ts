import { getAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL } from './constants';
import { sentry } from '@/shared/utils/sentryWrapper';
import { handleApiErrorForSentry } from './apiErrorHandler';
import {
  ClientError,
  ServerError,
  type ApiErrorResponse,
} from '@/shared/errors';

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
}

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

  void sentry.addBreadcrumb({
    category: 'api',
    message: `API ${method} ${endpoint}`,
    level: 'info',
    data: { url, method },
  });

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });

    const duration = Date.now() - startTime;

    void sentry.addBreadcrumb({
      category: 'api',
      message: `API ${method} ${endpoint} - ${response.status}`,
      level: response.ok ? 'info' : 'error',
      data: { status: response.status, duration },
    });

    if (response.status === 401) {
      await handleUnauthorized();
    }

    if (!response.ok) {
      return await handleErrorResponse(response, endpoint, url, options);
    }

    return await parseResponse<T>(response);
  } catch (error: unknown) {
    // any 대신 unknown 사용
    if (error instanceof Error && error.name === 'AbortError') {
      // 취소된 요청은 빈 객체를 반환하거나 적절히 처리 (T가 객체라고 가정할 때)
      return {} as T;
    }
    throw error;
  }
};

/**
 * 헤더 준비
 */
function prepareHeaders(
  headers: HeadersInit,
  requireAuth: boolean,
  body: RequestInit['body'], // any 대신 RequestInit 타입 사용
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
