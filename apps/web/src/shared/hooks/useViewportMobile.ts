import { useState, useEffect } from 'react';
import { VIEWPORT_MOBILE_BREAKPOINT } from '@/shared/utils/deviceDetection';

/**
 * 뷰포트 너비 기반 모바일 여부 훅
 *
 * CSS @media (max-width: 768px)와 동일한 기준으로
 * 리사이즈 시 반영됩니다. 드래그앤드롭 vs 버튼 UI 전환 등에 사용.
 */
export function useViewportMobile(): { isMobile: boolean; isDesktop: boolean } {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.innerWidth < VIEWPORT_MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < VIEWPORT_MOBILE_BREAKPOINT);
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isMobile, isDesktop: !isMobile };
}
