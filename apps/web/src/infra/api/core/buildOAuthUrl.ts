/**
 * OAuth 리다이렉트용 URL 생성 (항상 현재 페이지 origin 기준)
 *
 * window.location.href로 이동하므로 개발/운영 구분 없이
 * "지금 사용자가 있는 화면의 origin"으로 OAuth 요청을 보내야 함.
 * (VITE_API_BASE_URL이 운영 풀 URL로 되어 있어도 개발에서는 개발 API로 감)
 */
const RELATIVE_API_PATH = '/api';

export function buildOAuthUrl(endpoint: string): string {
  if (typeof window === 'undefined') {
    throw new Error('buildOAuthUrl은 브라우저에서만 사용할 수 있습니다.');
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${window.location.origin}${RELATIVE_API_PATH}${path}`;
}
