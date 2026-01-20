import type { ReactNode, ComponentType } from 'react';

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

/**
 * 페이지 1 - 떠다니는 카드
 */
export interface FloatingCard {
  id: number;
  src: string;
  delay: number;
  x: string;
  y: string;
  rotation: number;
  scale: number;
}

/**
 * 연결선 경로
 */
export interface ConnectingPath {
  d: string;
  delay: number;
}

/**
 * 페이지 2 - 기록 카드
 */
export interface RecordCard {
  id: number;
  src: string;
  title: string;
  x: string;
  y: string;
  rotation: number;
  delay: number;
  scale: number;
}

/**
 * 페이지 3 - 플로우 스텝
 */
export interface FlowStep {
  id: number;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
  delay: number;
  imageSrc: string;
}

/**
 * 페이지 3 - FlowStep 컴포넌트 Props
 */
export interface FlowStepProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  text: string;
  imageSrc: string;
}

/**
 * 페이지 4 - 지도 메모리
 */
export interface MapMemory {
  id: number;
  src: string;
  x: string;
  y: string;
  delay: number;
  size: number;
}
