/**
 * 애플리케이션의 라우트 경로 상수
 */
export const ROUTES = {
  HOME: '/home',
  RECORD: '/record',
  RECORD_LIST: '/records',
  RECORD_DETAIL: '/records/:id',
  CONNECTION: '/connection',
  CONNECTION_MANAGEMENT: '/records/:id/connections',
  ONBOARDING: '/onboarding',
  AUTH_CALLBACK: '/auth/callback',
  EMAIL_LOGIN: '/auth/email',
  EMAIL_SIGNUP: '/auth/signup',
  EMAIL_VERIFY: '/auth/verify',
  LOGIN: '/',
} as const;

/**
 * 라우트 경로 타입
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
