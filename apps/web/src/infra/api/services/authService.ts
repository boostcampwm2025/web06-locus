import { apiClient, buildApiUrl } from '../apiClient';
import { API_ENDPOINTS } from '../constants';
import type {
  SignupRequest,
  SignupVerifyRequest,
  LoginRequest,
  LoginResponse,
  ApiErrorResponse,
} from '@/infra/types/auth';
import { AuthError } from '@/infra/types/auth';

export type {
  SignupRequest,
  SignupVerifyRequest,
  LoginRequest,
  LoginResponse,
  ApiErrorResponse,
};
export { AuthError };

const API_FAIL_PREFIX = 'API 요청 실패';
const API_FAIL_STATUS_REGEX = /API 요청 실패: (\d+)/;

/**
 * 회원가입 요청 API 호출
 */
export async function requestSignup(request: SignupRequest): Promise<void> {
  await withAuthErrorHandling(API_ENDPOINTS.AUTH_SIGNUP, request, () =>
    apiClient(API_ENDPOINTS.AUTH_SIGNUP, {
      method: 'POST',
      body: JSON.stringify(request),
      requireAuth: false,
    }),
  );
}

/**
 * 이메일 인증 코드 확인 API 호출
 */
export async function verifySignup(
  request: SignupVerifyRequest,
): Promise<void> {
  await withAuthErrorHandling(API_ENDPOINTS.AUTH_SIGNUP_VERIFY, request, () =>
    apiClient(API_ENDPOINTS.AUTH_SIGNUP_VERIFY, {
      method: 'POST',
      body: JSON.stringify(request),
      requireAuth: false,
    }),
  );
}

/**
 * 로그인 API 호출
 * refreshToken은 쿠키로 자동 저장됨
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  return await withAuthErrorHandling(API_ENDPOINTS.AUTH_LOGIN, request, () =>
    apiClient<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify(request),
      requireAuth: false,
    }),
  );
}

/**
 * 로그아웃 API 호출
 */
export async function logout(): Promise<void> {
  await apiClient(API_ENDPOINTS.AUTH_LOGOUT, { method: 'POST' });
}

async function withAuthErrorHandling<T>(
  endpoint: string,
  requestBody: unknown,
  apiCall: () => Promise<T>,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    const status = extractStatusFromApiClientError(error);
    if (status !== null) {
      await fetchAndThrowAuthErrorIfNotOk(endpoint, requestBody, status);
    }
    throw error;
  }
}

function extractStatusFromApiClientError(error: unknown): number | null {
  if (!(error instanceof Error)) return null;
  if (!error.message.includes(API_FAIL_PREFIX)) return null;

  const match = API_FAIL_STATUS_REGEX.exec(error.message);
  if (!match) return null;

  const status = Number.parseInt(match[1], 10);
  return Number.isNaN(status) ? null : status;
}

async function fetchAndThrowAuthErrorIfNotOk(
  endpoint: string,
  body: unknown,
  status: number,
): Promise<never> {
  const response = await fetch(buildApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include', // 쿠키 전송/수신을 위해 필수
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new AuthError(errorData.message, errorData.code, status);
  }

  // 이 함수는 "apiClient가 실패했다"는 상황에서만 호출됨. 상태 불일치(희귀 케이스).
  throw new Error('API 요청 실패 처리 중 상태 불일치가 발생했습니다.');
}

/**
 * API 에러 응답 파싱
 */
async function parseErrorResponse(
  response: Response,
): Promise<ApiErrorResponse> {
  try {
    const errorData: unknown = await response.json();
    if (
      typeof errorData === 'object' &&
      errorData !== null &&
      'status' in errorData &&
      'message' in errorData
    ) {
      return errorData as ApiErrorResponse;
    }
  } catch {
    // JSON 파싱 실패 시 기본 메시지 사용
  }

  return {
    status: 'error',
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다.',
  };
}
