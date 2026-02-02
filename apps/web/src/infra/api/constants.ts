// 개발/프로덕션 모두 /api prefix 사용
// 로컬 개발: Vite 프록시(/api) 사용
// 배포: nginx 프록시(/api) 사용
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_OAUTH2: (provider: string) => `/auth/oauth2/${provider}`,
  AUTH_SIGNUP: '/auth/signup/request',
  AUTH_SIGNUP_VERIFY: '/auth/signup/confirm',
  AUTH_LOGIN: '/auth/login',
  AUTH_REISSUE: '/auth/reissue',
  AUTH_LOGOUT: '/auth/logout',

  // Users
  USERS_ME: '/users/me',

  // Records
  RECORDS: '/records',
  RECORDS_ALL: '/records/all',
  RECORDS_BY_ID: (publicId: string) => `/records/${publicId}`,
  RECORDS_FAVORITE: (publicId: string) => `/records/${publicId}/favorite`,
  RECORDS_SEARCH: '/records/search',
  RECORDS_GRAPH: (publicId: string) => `/records/${publicId}/graph`,
  RECORDS_GRAPH_DETAILS: (publicId: string) =>
    `/records/${publicId}/graph/details`,
  RECORDS_GRAPH_RECORDS: (publicId: string) =>
    `/records/${publicId}/graph/records`,

  // Connections
  CONNECTIONS: '/connections',
  CONNECTIONS_BY_ID: (publicId: string) => `/connections/${publicId}`,

  // Tags
  TAGS: '/tags',
  TAGS_BY_ID: (publicId: string) => `/tags/${publicId}`,

  // Maps
  MAPS_GEOCODE: '/maps',
  MAPS_REVERSE_GEOCODE: '/maps/reverse-geocode',

  // Notifications
  NOTIFICATIONS_SETTINGS: '/notifications/settings',
  NOTIFICATIONS_SETTINGS_TIME: '/notifications/settings/time',
} as const;
