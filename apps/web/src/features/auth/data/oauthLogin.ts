import type { OAuthProvider } from '@/shared/types';
import { API_ENDPOINTS } from '@/infra/api/constants';

/**
 * OAuth 로그인 URL 생성
 * window.location.href로 이동하므로 상대 경로를 사용하면 현재 origin 기준으로 이동
 * 개발 환경에서는 Vite 프록시(/api)를 통해 백엔드로 요청이 전달됨
 */
function getOAuthLoginUrl(provider: OAuthProvider): string {
  const endpoint = API_ENDPOINTS.AUTH_OAUTH2(provider);

  // 개발/프로덕션 모두 /api prefix 사용
  // - 개발: Vite 프록시가 /api를 제거하고 백엔드로 전달
  // - 프로덕션: nginx가 /api로 시작하는 요청을 백엔드로 프록시
  return `/api${endpoint}`;
}

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = getOAuthLoginUrl(provider);
};
