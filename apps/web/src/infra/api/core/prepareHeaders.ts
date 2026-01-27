import { getAccessToken } from '../../storage/tokenStorage';

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

/**
 * 헤더 준비
 */
export function prepareHeaders(
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
