export type ToastVariant = 'error' | 'warning' | 'info' | 'success';

export interface ToastErrorMessageProps {
  message: string;
  variant?: ToastVariant;
  className?: string;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}
