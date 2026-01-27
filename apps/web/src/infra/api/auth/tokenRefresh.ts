import { setAccessToken } from '../../storage/tokenStorage';
import { API_ENDPOINTS } from '../constants';
import { logger } from '@/shared/utils/logger';
import { AuthError } from '@/shared/errors';
import { buildApiUrl } from '../core/buildUrl';
import { prepareHeaders } from '../core/prepareHeaders';
import { parseResponse } from '../core/responseParser';
import {
  handleUnauthorized,
  handleErrorResponse,
} from '../handlers/errorHandler';
import type { ApiClientOptions } from '..';

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
 * 401 발생 시 토큰 재발급 및 요청 재시도를 제어하는 하위 함수
 */
export async function handleTokenRefreshFlow<T>(
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
        options /** 큐에 넣을 때 당시의 options를 그대로 보존 */,
      });
    });
  }

  isRefreshing = true;

  try {
    const newAccessToken = await executeRefresh();

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
 * 대기 중인 요청 재시도 로직
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
 * authStore에서도 사용할 수 있도록 export
 */
export async function executeRefresh(): Promise<string> {
  const url = buildApiUrl(API_ENDPOINTS.AUTH_REISSUE);

  try {
    const response = await fetchRefreshToken(url);
    const accessToken = await parseRefreshResponse(response, url);

    setAccessToken(accessToken);
    logRefreshSuccess(url, accessToken, response);

    return accessToken;
  } catch (error) {
    handleRefreshError(error, url);
    throw error;
  }
}

/**
 * 재발급 API 호출
 */
async function fetchRefreshToken(url: string): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleRefreshErrorResponse(response, url);
  }

  return response;
}

/**
 * 재발급 응답 파싱
 */
async function parseRefreshResponse(
  response: Response,
  url: string,
): Promise<string> {
  const responseText = await response.text();

  let parsedData: {
    status?: string;
    data?: { accessToken?: string };
  };

  try {
    parsedData = JSON.parse(responseText) as {
      status?: string;
      data?: { accessToken?: string };
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

  const accessToken = parsedData.data?.accessToken;

  if (!accessToken) {
    logger.error(new Error('토큰 재발급 실패: 응답에 액세스 토큰이 없습니다'), {
      url,
      parsedData: JSON.stringify(parsedData).substring(0, 500),
    });
    await handleUnauthorized();
    throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  return accessToken;
}

/**
 * 재발급 에러 응답 처리
 */
async function handleRefreshErrorResponse(
  response: Response,
  url: string,
): Promise<never> {
  const setCookieHeader = response.headers.get('Set-Cookie');
  const hasSetCookie = !!setCookieHeader;

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
    setCookieHeader: setCookieHeader?.substring(0, 100),
    responseHeaders: {
      'content-type': response.headers.get('content-type'),
      'set-cookie': hasSetCookie ? 'present' : 'missing',
    },
  });

  await handleUnauthorized();
  throw new AuthError('세션이 만료되었습니다. 다시 로그인해주세요.');
}

/**
 * 재발급 성공 로깅
 */
function logRefreshSuccess(
  url: string,
  accessToken: string,
  response: Response,
): void {
  const setCookieHeader = response.headers.get('Set-Cookie');
  const hasSetCookie = !!setCookieHeader;

  logger.info('리프레시 토큰 재발급 성공', {
    url,
    hasNewAccessToken: !!accessToken,
    hasSetCookie,
    setCookieHeader: setCookieHeader?.substring(0, 100),
    accessTokenLength: accessToken.length,
  });
}

/**
 * 재발급 에러 처리
 */
function handleRefreshError(error: unknown, url: string): void {
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
}
