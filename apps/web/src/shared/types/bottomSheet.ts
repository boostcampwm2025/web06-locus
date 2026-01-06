export type BottomSheetHeight =
  | 'compact'
  | 'image'
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
