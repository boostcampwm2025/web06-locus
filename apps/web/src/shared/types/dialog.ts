/**
 * 액션 시트 아이템 타입
 */
export interface ActionSheetItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

/**
 * 액션 시트 Props
 */
export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
  anchorElement?: HTMLElement | null;
  className?: string;
}

/**
 * 확인 다이얼로그 Props
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
  className?: string;
}
