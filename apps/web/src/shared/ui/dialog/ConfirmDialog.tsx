import { useEffect } from 'react';
import type { ConfirmDialogProps } from '@/shared/types';

/**
 * 확인 다이얼로그
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 다이얼로그 본체 */}
      <div
        className={`
          fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
          w-[calc(100%-4rem)] max-w-sm  /* 가로 너비를 조금 더 여유 있게 조정 */
          bg-white rounded-[32px] shadow-2xl
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          {/* 제목: 굵고 크게 */}
          <h3 className="text-[22px] font-normal text-gray-900 mb-3 text-center">
            {title}
          </h3>

          {/* 메시지: 가독성 좋은 크기와 색상 */}
          <p className="text-[16px] text-gray-500 mb-5 text-center leading-relaxed">
            {message}
          </p>

          {/* 버튼 영역: Outlined 스타일 반영 */}
          <div className="flex w-full gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4.5 bg-white text-gray-500 border border-gray-200 rounded-[18px] font-bold text-[17px] hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`
                flex-1 px-4 py-4.5 bg-white rounded-[18px] font-bold text-[17px] border transition-colors
                ${
                  variant === 'danger'
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-gray-900 border-gray-900 hover:bg-gray-50'
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
