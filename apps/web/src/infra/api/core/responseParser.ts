import type { ApiErrorResponse } from '@/shared/errors';

/**
 * 응답 파싱
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (response.status === 204) return {} as T;

  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    return text as unknown as T; // 단계적 캐스팅으로 unsafe return 방지
  }

  const json = (await response.json()) as unknown;
  return json as T; // unknown에서 T로 단언
}

/**
 * 에러 바디 파싱
 */
export async function parseErrorBody(
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
