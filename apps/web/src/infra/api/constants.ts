export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000';

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_OAUTH2: (provider: string) => `/auth/oauth2/${provider}`,

  // Records
  RECORDS: '/records',
  RECORDS_BY_ID: (publicId: string) => `/records/${publicId}`,
  RECORDS_SEARCH: '/records/search',
  RECORDS_GRAPH: (publicId: string) => `/records/${publicId}/graph`,
  RECORDS_GRAPH_RECORDS: (publicId: string) =>
    `/records/${publicId}/graph/records`,
} as const;
