import type { OAuthProvider } from '@/shared/types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000';

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = `${API_BASE_URL}/auth/oauth2/${provider}`;
};
