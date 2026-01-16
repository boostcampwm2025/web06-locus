import type { AuthTokens } from '@/features/auth/types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const getTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  // refreshToken은 쿠키에만 저장될 수 있으므로, accessToken만 있어도 인증 상태 유지
  if (!accessToken) {
    return null;
  }

  // refreshToken이 없거나 빈 문자열이면 빈 문자열로 반환 (쿠키에만 있을 수 있음)
  return { accessToken, refreshToken: refreshToken ?? '' };
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};
