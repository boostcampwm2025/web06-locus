import type { OAuthProvider } from '@/shared/types';
import { API_ENDPOINTS } from '@/infra/api/constants';
import { buildOAuthUrl } from '@/infra/api';

/**
 * OAuth 로그인 URL 생성 (항상 현재 origin 기준 → 개발/운영 구분 없이 맞는 서버로 이동)
 */
function getOAuthLoginUrl(provider: OAuthProvider): string {
  const endpoint = API_ENDPOINTS.AUTH_OAUTH2(provider);
  return buildOAuthUrl(endpoint);
}

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = getOAuthLoginUrl(provider);
};
