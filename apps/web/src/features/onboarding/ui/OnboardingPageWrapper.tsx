import type { OnboardingPageWrapperProps } from '../types';

/**
 * 온보딩 페이지들을 위한 공통 레이아웃 래퍼
 * 전체 화면 레이아웃과 공통 스타일을 제공합니다.
 */
export function OnboardingPageWrapper({
  children,
}: OnboardingPageWrapperProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {children}
    </div>
  );
}
