import { getAccessToken, setAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import { logger } from '@/shared/utils/logger';
import { handleApiErrorForSentry } from './apiErrorHandler';
import {
  AuthError,
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

/**
 * 401 발생 시 토큰 재발급 및 요청 재시도를 제어하는 하위 함수
 */
async function handleTokenRefreshFlow<T>(
  url: string,
  options: RequestInit,
  _currentHeaders: Record<string, string> | undefined,
  endpoint: string,
  apiOptions: ApiClientOptions,
): Promise<T> {
  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      failedQueue.push({
        resolve: (value) => resolve(value as T),
        reject,
        url,
        // 큐에 넣을 때 당시의 options를 그대로 보존
        options,
      });
    });
  }

  isRefreshing = true;

  try {
    const newAccessToken = await executeRefresh();

    // newAccessToken이 없으면 재시도하지 않고 에러 throw
    if (!newAccessToken) {
      await handleUnauthorized();
      throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 1. 대기 중인 요청들 재시도
    void retryFailedRequests(newAccessToken);

    // 2. 현재 실패했던 본래 요청 재시도
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { headers: _, ...restOptions } = options;
    const method = (options.method ?? 'GET').toUpperCase();

    // prepareHeaders를 재사용하여 가장 깨끗한 상태의 헤더를 만듦
    const retryHeaders = prepareHeaders(
      apiOptions.headers ?? {}, // 초기 apiClient 호출 시 넘어온 원본 커스텀 헤더
      true,
      restOptions.body,
      method,
    );

    // 발급받은 새 토큰을 명시적으로 주입 (강제 덮어쓰기)
    retryHeaders.Authorization = `Bearer ${newAccessToken}`;

    const retryResponse = await fetch(url, {
      ...restOptions,
      headers: retryHeaders,
      credentials: 'include', // 쿠키 전송/수신을 위해 필수
    });

    if (retryResponse.ok) {
      return await parseResponse<T>(retryResponse);
    }

    return await handleErrorResponse(retryResponse, endpoint, url, apiOptions);
  } catch (error) {
    // 에러 발생 시에도 대기 중인 요청들을 처리 (실패로 reject)
    if (failedQueue.length > 0) {
      const queue = [...failedQueue];
      failedQueue.length = 0;
      queue.forEach(({ reject }) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    }

    await handleUnauthorized();
    throw error;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 대기 중인 요청 재시도 로직 수정
 */
async function retryFailedRequests(newAccessToken: string): Promise<void> {
  const queue = [...failedQueue];
  failedQueue.length = 0;

  await Promise.allSettled(
    queue.map(async ({ url, options, resolve, reject }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { headers: _, ...restOptions } = options;
        const method = (options.method ?? 'GET').toUpperCase();

        const updatedHeaders = prepareHeaders(
          {},
          true,
          restOptions.body,
          method,
        );

        updatedHeaders.Authorization = `Bearer ${newAccessToken}`;

        const response = await fetch(url, {
          ...restOptions,
          headers: updatedHeaders,
          credentials: 'include', // 쿠키 전송/수신을 위해 필수
        });

        if (response.ok) {
          resolve(await parseResponse(response));
        } else {
          reject(new Error(`Retry failed: ${response.status}`));
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Request failed'));
      }
    }),
  );
}

/**
 * 리프레시 토큰 재발급 API 호출 본체
 */
async function executeRefresh(): Promise<string> {
  const url = buildApiUrl(API_ENDPOINTS.AUTH_REISSUE);

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
    });

    // Response 헤더 확인 (Set-Cookie가 있는지)
    const setCookieHeader = response.headers.get('Set-Cookie');
    const hasSetCookie = !!setCookieHeader;

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: unknown;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }

      logger.error(new Error(`토큰 재발급 실패: ${response.status}`), {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
        hasSetCookie,
        setCookieHeader: setCookieHeader?.substring(0, 100), // 처음 100자만
        responseHeaders: {
          'content-type': response.headers.get('content-type'),
          'set-cookie': hasSetCookie ? 'present' : 'missing',
        },
      });
      await handleUnauthorized();
      throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 응답 body를 텍스트로 먼저 읽어서 확인
    const responseText = await response.text();

    let parsedData: {
      status?: string;
      data?: { accessToken?: string };
      accessToken?: string;
    };
    try {
      parsedData = JSON.parse(responseText) as {
        status?: string;
        data?: { accessToken?: string };
        accessToken?: string;
      };
    } catch (parseError) {
      logger.error(
        new Error(
          `토큰 재발급 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        ),
        { url, responseText: responseText.substring(0, 500) },
      );
      await handleUnauthorized();
      throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    // API 응답 구조에 따라 accessToken 추출
    // 구조 1: { status: "success", data: { accessToken: string } }
    // 구조 2: { accessToken: string }
    const accessToken = parsedData.data?.accessToken ?? parsedData.accessToken;

    // accessToken이 없으면 에러 throw
    if (!accessToken) {
      logger.error(
        new Error('토큰 재발급 실패: 응답에 액세스 토큰이 없습니다'),
        {
          url,
          parsedData: JSON.stringify(parsedData).substring(0, 500),
        },
      );
      await handleUnauthorized();
      throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    setAccessToken(accessToken);

    logger.info('리프레시 토큰 재발급 성공', {
      url,
      hasNewAccessToken: !!accessToken,
      hasSetCookie,
      setCookieHeader: setCookieHeader?.substring(0, 100), // 처음 100자만
      accessTokenLength: accessToken?.length,
    });
    return accessToken;
  } catch (error) {
    // AuthError는 이미 handleUnauthorized가 호출되었으므로 다시 호출하지 않음
    if (!(error instanceof AuthError)) {
      logger.error(
        error instanceof Error ? error : new Error('토큰 재발급 중 예외 발생'),
        {
          url,
          error: String(error),
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      );
    }
    throw error;
  }
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

/**
 * 에러 바디 파싱
 */
async function parseErrorBody(
  response: Response,
): Promise<ApiErrorResponse | null> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null;

  try {
    // Response body가 이미 사용되었을 수 있으므로 clone 시도
    const responseToParse = response.bodyUsed ? response : response.clone();
    // unknown으로 먼저 받고, 타입 가드로 검증.
    const data = (await responseToParse.json()) as unknown;
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
