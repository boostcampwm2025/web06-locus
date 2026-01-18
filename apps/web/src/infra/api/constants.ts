// 개발/프로덕션 모두 /api prefix 사용
// 로컬 개발: Vite 프록시(/api) 사용
// 배포: nginx 프록시(/api) 사용
export const API_BASE_URL = '/api';

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_OAUTH2: (provider: string) => `/auth/oauth2/${provider}`,
  AUTH_SIGNUP: '/auth/signup/request',
  AUTH_SIGNUP_VERIFY: '/auth/signup/confirm',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',

  // Records
  RECORDS: '/records',
  RECORDS_BY_ID: (publicId: string) => `/records/${publicId}`,
  RECORDS_SEARCH: '/records/search',
  RECORDS_GRAPH: (publicId: string) => `/records/${publicId}/graph`,
  RECORDS_GRAPH_RECORDS: (publicId: string) =>
    `/records/${publicId}/graph/records`,

  // Connections
  CONNECTIONS: '/connections',
  CONNECTIONS_BY_ID: (publicId: string) => `/connections/${publicId}`,
} as const;
