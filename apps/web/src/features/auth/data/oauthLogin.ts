import type { OAuthProvider } from '@/shared/types';
import { buildApiUrl } from '@/infra/api/apiClient';
import { API_ENDPOINTS } from '@/infra/api/constants';

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = buildApiUrl(API_ENDPOINTS.AUTH_OAUTH2(provider));
};
