/**
 * 뷰포트 기반 UI 전환 유틸리티
 *
 * 현재 창 너비로 판단합니다.
 * - 터치 노트북, iPad 가로 모드 등에서도 창 크기에 맞는 UI 표시
 * - CSS @media (max-width: 768px)와 동일한 기준 사용 권장
 */

/** 모바일 UI 전환 기준 (px) */
export const VIEWPORT_MOBILE_BREAKPOINT = 768;

/**
 * 현재 뷰포트가 데스크톱(넓은 화면)인지 확인
 * - window.innerWidth >= VIEWPORT_MOBILE_BREAKPOINT 이면 true
 * - SSR 시 false (모바일 UI 기본)
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= VIEWPORT_MOBILE_BREAKPOINT;
}

/**
 * 현재 뷰포트가 모바일(좁은 화면)인지 확인
 */
export function isMobileViewport(): boolean {
  return !isDesktopViewport();
}
