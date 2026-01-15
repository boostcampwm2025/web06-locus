export type ToastVariant = 'error' | 'warning' | 'info' | 'success';

export interface ToastErrorMessageProps {
  message: string;
  variant?: ToastVariant;
  className?: string;
}
