import type { ReactNode } from 'react';

/**
 * 온보딩 페이지 래퍼 컴포넌트의 Props
 */
export interface OnboardingPageWrapperProps {
  children: ReactNode;
}

/**
 * 온보딩 플로우 컴포넌트의 Props
 */
export interface OnboardingFlowProps {
  onComplete?: () => void;
}
