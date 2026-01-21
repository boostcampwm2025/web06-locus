import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import ToastErrorMessage from '../alert/ToastErrorMessage';
import type { ToastVariant, Toast } from '@/shared/types';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      let wasAdded = false;
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((prev) => {
        // 현재 화면에 같은 메시지가 이미 떠 있는지 확인
        const isDuplicate = prev.some((toast) => toast.message === message);

        // 중복이면 상태를 변경하지 않고 그대로 반환 (추가 방지)
        if (isDuplicate) return prev;

        // 중복이 아닐 때만 새 토스트 추가
        wasAdded = true;
        return [...prev, { id, message, variant }];
      });

      // 실제로 추가되었을 때만 타이머 설정 (setToasts 밖에서 실행)
      if (wasAdded) {
        setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3000);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 토스트 컨테이너 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 pointer-events-none w-full items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <ToastErrorMessage
              message={toast.message}
              variant={toast.variant}
              // 최소 너비를 설정하여 메시지가 짧아도 어색하지 않게 처리
              className="min-w-[320px] shadow-lg"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
