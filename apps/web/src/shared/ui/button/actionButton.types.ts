import type { ButtonHTMLAttributes } from 'react';

export type ActionButtonVariant = 'primary' | 'secondary';

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  children: React.ReactNode;
}
