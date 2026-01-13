import { getAccessToken } from '../storage/tokenStorage';
import { API_BASE_URL } from './constants';

export interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const { requireAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders = prepareHeaders(headers, requireAuth);
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    await handleUnauthorized();
  }

  if (!response.ok) {
    await handleErrorResponse(response);
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
 * @returns Record<string, string>
 */
function prepareHeaders(
  headers: HeadersInit,
  requireAuth: boolean,
): Record<string, string> {
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...normalizeHeaders(headers),
  };

  if (requireAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  return requestHeaders;
}

function buildApiUrl(endpoint: string): string {
  return endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
}

async function handleUnauthorized(): Promise<void> {
  const { useAuthStore } = await import('@/features/auth/domain/authStore');
  useAuthStore.getState().clearAuth();
}

async function handleErrorResponse(response: Response): Promise<never> {
  const errorText = await response.text();
  const statusText = response.statusText || 'Unknown Error';
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
