import type { RefObject } from 'react';
import type React from 'react';

export type BottomSheetHeight =
  | 'compact'
  | 'image'
  | 'summary'
  | 'filter'
  | 'small'
  | 'medium'
  | 'full';

export interface BaseBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: BottomSheetHeight;
  showHandle?: boolean;
  className?: string;
}

export interface UseBottomSheetOptions {
  isOpen: boolean;
  onClose: () => void;
  snapThreshold?: number;
  animationDuration?: number;
}

export interface UseBottomSheetReturn {
  sheetRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  shouldRender: boolean;
  currentTranslateY: number;
  isAnimating: boolean;
  isDragging: boolean;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  overlayClassName: string;
  sheetStyle: React.CSSProperties;
}
