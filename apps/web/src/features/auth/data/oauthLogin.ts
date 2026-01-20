import type { OAuthProvider } from '@/shared/types';
import { API_ENDPOINTS } from '@/infra/api/constants';
import { buildApiUrl } from '@/infra/api/apiClient';

/**
 * OAuth 로그인 URL 생성
 * window.location.href로 이동하므로 절대 URL이 필요
 */
function getOAuthLoginUrl(provider: OAuthProvider): string {
  const endpoint = API_ENDPOINTS.AUTH_OAUTH2(provider);
  return buildApiUrl(endpoint, true);
}

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = getOAuthLoginUrl(provider);
};
