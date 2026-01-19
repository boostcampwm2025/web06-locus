import { Logo } from '@/shared/ui/icons/Logo';
import type { AuthPageHeaderProps } from '@/shared/types';

export function AuthPageHeader({ title, subtitle }: AuthPageHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <Logo className="w-24 h-24 sm:w-[140px] sm:h-[140px]" />
      {title && (
        <h1 className="text-2xl sm:text-3xl font-normal text-gray-900">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-gray-500 text-xs sm:text-sm px-4 text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}
