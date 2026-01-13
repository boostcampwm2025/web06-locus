import type { OAuthProvider } from '@/shared/types';
import { API_BASE_URL } from '@/infra/api/constants';

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = `${API_BASE_URL}/auth/oauth2/${provider}`;
};
