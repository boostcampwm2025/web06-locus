import { motion } from 'motion/react';
import { ErrorIcon } from '@/shared/ui/icons/ErrorIcon';
import type { ToastErrorMessageProps } from '@/shared/types';

const variantConfig = {
  error: {
    color: 'text-red-500',
    label: 'Error',
  },
  warning: {
    color: 'text-amber-500',
    label: 'Warning',
  },
  info: {
    color: 'text-blue-500',
    label: 'Info',
  },
  success: {
    color: 'text-emerald-500',
    label: 'Success',
  },
} as const;

export default function ToastErrorMessage({
  message,
  variant = 'error',
  className = '',
}: ToastErrorMessageProps) {
  const { color, label } = variantConfig[variant];

  return (
    <motion.div
      // 애니메이션: 살짝 아래에서 위로 올라오며 나타남
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`
        bg-white px-5 py-4 rounded-2xl flex items-start gap-4 
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] 
        border border-gray-100 min-w-[340px] max-w-[420px]
        ${className}
      `}
    >
      {/* 기존 ErrorIcon 활용 (색상만 주입) */}
      <div className={`${color} mt-0.5 shrink-0`}>
        <ErrorIcon className="w-5 h-5" />
      </div>

      {/* 텍스트 영역: 레이블과 메시지 분리 */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.15em] ${color}`}
        >
          {label}
        </span>
        <p className="text-sm font-semibold text-gray-700 leading-snug wrap-break-word">
          {message}
        </p>
      </div>
    </motion.div>
  );
}
