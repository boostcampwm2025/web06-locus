import { useEffect } from 'react';
import type { ConfirmDialogProps } from '@/shared/types';

/**
 * 확인 다이얼로그 컴포넌트
 * 화면 중앙에 표시되는 확인 모달
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  variant = 'default',
  className = '',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* 어두운 오버레이 */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 모달 다이얼로그 */}
      <div
        className={`
          fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
          w-[calc(100%-2rem)] max-w-sm
          bg-white rounded-2xl shadow-xl
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-6">
          <h3
            id="confirm-dialog-title"
            className="text-xl font-semibold text-gray-900 mb-2 text-center"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-message"
            className="text-sm text-gray-500 mb-6 text-center"
          >
            {message}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                ${
                  variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                    : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
                }
              `}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
