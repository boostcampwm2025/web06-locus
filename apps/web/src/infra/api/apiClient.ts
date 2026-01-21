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

  // API_BASE_URL이 절대 URL인 경우 (환경 변수로 개발/프로덕션 서버 URL 설정)
  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL}${endpoint}`;
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
  const status = response.status;
  const errorBody = await parseErrorBody(response);

  try {
    await handleApiErrorForSentry(response, endpoint, url, options);
  } catch (err) {
    console.error('Sentry 전송 실패:', err);
  }

  // 메시지 및 코드 결정 (우선순위 전략)
  const errorCode = errorBody?.code;
  const errorMessage = determineErrorMessage(status, errorBody);

  // 에러 클래스 분기 처리
  const errorResponse = errorBody ?? undefined;
  const ErrorClass = status >= 500 ? ServerError : ClientError;
  throw new ErrorClass(errorMessage, status, errorCode, errorResponse);
}

/**
 * JSON 또는 Text 응답 안전하게 파싱
 */
async function parseErrorBody(
  response: Response,
): Promise<ApiErrorResponse | null> {
  // JSON이 아니면 null 반환
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return null;
  }

  try {
    const text = await response.clone().text();
    const parsed = JSON.parse(text) as unknown;

    // 유효한 ApiErrorResponse 형식인지 확인
    if (!isValidApiErrorResponse(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * 파싱된 객체가 유효한 ApiErrorResponse 형식인지 확인
 */
function isValidApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('status' in value)) {
    return false;
  }

  return value.status === 'fail' || value.status === 'error';
}

/**
 * 상황별 최적의 에러 메시지 결정
 */
function determineErrorMessage(
  status: number,
  body: ApiErrorResponse | null,
): string {
  if (!body) {
    // body가 null인 경우 기본 메시지 반환
    return status >= 500
      ? '서버에 일시적인 문제가 발생했습니다.'
      : '요청 처리 중 오류가 발생했습니다.';
  }

  // 1. 백엔드에서 준 메시지가 있으면 최우선
  if ('message' in body && body.message) {
    return body.message;
  }

  // 2. Fail 상태인데 메시지가 없으면 code라도 반환
  if (body.status === 'fail' && body.code) {
    return body.code;
  }

  // 3. 마지막 수단: 상태 코드별 기본 메시지
  return status >= 500
    ? '서버에 일시적인 문제가 발생했습니다.'
    : '요청 처리 중 오류가 발생했습니다.';
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
