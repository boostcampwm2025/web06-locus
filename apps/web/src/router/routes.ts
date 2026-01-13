/**
 * 애플리케이션의 라우트 경로 상수
 */
export const ROUTES = {
  HOME: '/home',
  RECORD: '/record',
  AUTH_CALLBACK: '/auth/callback',
  LOGIN: '/',
} as const;

/**
 * 라우트 경로 타입
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
