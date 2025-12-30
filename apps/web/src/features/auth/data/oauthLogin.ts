import type { OAuthProvider } from '@/shared/types';

/**
 * OAuth 로그인 처리 함수
 * @param provider - OAuth 제공자 (google, naver, kakao)
 */
export const handleOAuthLogin = (_provider: OAuthProvider) => {
  // TODO: OAuth 로그인 로직 구현
  // 1. OAuth 제공자별 인증 URL 생성
  // 2. 사용자를 인증 페이지로 리다이렉트
  // 3. 콜백 처리 및 토큰 저장
  void _provider;
};
