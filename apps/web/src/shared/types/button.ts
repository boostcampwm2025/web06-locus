import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface OptionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}
