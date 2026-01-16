import ErrorIcon from '@/shared/icons/ErrorIcon';
import type { ToastVariant, ToastErrorMessageProps } from '@/shared/types';

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; text: string }
> = {
  error: {
    container: 'bg-red-50 border border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  warning: {
    container: 'bg-amber-50 border border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
  info: {
    container: 'bg-blue-50 border border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  success: {
    container: 'bg-green-50 border border-green-200',
    icon: 'text-green-600',
    text: 'text-green-800',
  },
} as const;

export default function ToastErrorMessage({
  message,
  variant = 'error',
  className = '',
}: ToastErrorMessageProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${styles.container} ${className}`}
    >
      <ErrorIcon className={`w-5 h-5 ${styles.icon} shrink-0`} />
      <span className={`text-sm ${styles.text}`}>{message}</span>
    </div>
  );
}
