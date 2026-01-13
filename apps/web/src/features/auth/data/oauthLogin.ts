import type { OAuthProvider } from '@/shared/types';
import { buildApiUrl } from '@/infra/api/apiClient';

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = buildApiUrl(`/auth/oauth2/${provider}`);
};
