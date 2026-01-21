import { createContext } from 'react';
import type { ToastContextType } from '@/shared/types';

// React Fast Refresh 대응을 위해 타입 추론 문제 방지
export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);
