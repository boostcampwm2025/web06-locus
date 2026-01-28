import type { AuthTokens } from '@/features/auth/types/auth';

// 메모리 기반 accessToken 저장소
const tokenStore = {
  accessToken: null as string | null,
};

export const saveTokens = (accessToken: string): void => {
  // accessToken은 메모리에만 저장
  tokenStore.accessToken = accessToken;
};

export const getTokens = (): AuthTokens | null => {
  if (!tokenStore.accessToken) {
    return null;
  }

  // refreshToken은 쿠키에만 있으므로 빈 문자열로 반환
  return { accessToken: tokenStore.accessToken, refreshToken: '' };
};

export const clearTokens = (): void => {
  tokenStore.accessToken = null;
};

export const getAccessToken = (): string | null => {
  if (
    !tokenStore.accessToken ||
    tokenStore.accessToken === 'undefined' ||
    tokenStore.accessToken === 'null'
  ) {
    return null;
  }

  return tokenStore.accessToken;
};

export const setAccessToken = (
  accessToken: string | null | undefined,
): void => {
  if (!accessToken || accessToken === 'undefined') {
    tokenStore.accessToken = null;
  } else {
    tokenStore.accessToken = accessToken;
  }
};
