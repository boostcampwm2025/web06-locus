import { useViewportMobile } from '@/shared/hooks/useViewportMobile';

/**
 * [기기 환경 정보 계산 (파일 로드 시 딱 1회 실행)
 */
const DEVICE_INFO = (() => {
  if (typeof window === 'undefined') {
    return { isPWA: false, isPhone: false, isTablet: false };
  }

  const ua = navigator.userAgent;
  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isPhone = /Android|iPhone|iPod/i.test(ua);

  const isTablet =
    /iPad/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && ua.includes('Macintosh'));

  return { isPWA, isPhone, isTablet };
})();

/**
 * 기기 타입 및 레이아웃 환경 판단 훅
 *
 * 판단 로직
 * - 스마트폰: 항상 모바일 UI
 * - 태블릿/데스크톱: 뷰포트 크기에 따라 반응형
 *
 * @returns 기기 타입 및 환경 정보
 *
 * @example
 * ```tsx
 * function RecordListPage() {
 *   const { isMobile, isPhone, isTablet } = useDeviceType();
 *
 *   if (isMobile) {
 *     return <RecordListPageMobile />;
 *   }
 *   return <RecordListPageDesktop />;
 * }
 * ```
 */
export function useDeviceType() {
  const { isMobile: isMobileViewport } = useViewportMobile();
  const { isPhone, isTablet, isPWA } = DEVICE_INFO;

  /**
   * 최종 UI 레이아웃 결정
   * - 스마트폰: 기기 특성상 항상 모바일 UI 선호
   * - 태블릿/데스크톱: 화면 크기에 따른 유연한 대응(반응형)
   */
  const isMobile = isPhone || isMobileViewport;

  return {
    isMobile /** 모바일 레이아웃 여부 (최종 판단) */,
    isDesktop: !isMobile /** 데스크톱 레이아웃 여부 (최종 판단) */,
    isPWA /** PWA standalone 모드 여부 (참고용) */,
    isPhone /** 스마트폰 여부 (User Agent 기반) */,
    isTablet /** 태블릿 여부 (User Agent + 터치 포인트 기반) */,
    isMobileDevice:
      isPhone || isTablet /** 전체 모바일 기기 여부 (스마트폰 + 태블릿) */,
  };
}
