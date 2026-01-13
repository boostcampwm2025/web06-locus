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
