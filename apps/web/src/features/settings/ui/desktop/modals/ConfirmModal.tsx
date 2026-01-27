import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 공통 확인 모달 컴포넌트
 * 삭제, 로그아웃 등 위험한 작업 확인에 사용
 */
export function ConfirmModal({
  isOpen,
  icon: Icon,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-300 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl p-10 text-center"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
              {description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onCancel}
                className="py-4 rounded-2xl bg-gray-50 text-gray-500 font-black hover:bg-gray-100 transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
