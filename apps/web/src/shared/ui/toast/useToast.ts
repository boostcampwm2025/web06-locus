import { useContext } from 'react';
import { ToastContext } from './ToastContext';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast는 ToastProvider 내에서만 사용할 수 있습니다.');
  }
  return context;
}
