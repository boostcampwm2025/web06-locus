import type { OptionButtonProps } from '@/shared/types/button';

export default function OptionButton({
  icon,
  title,
  description,
  onClick,
  className = '',
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-4 hover:bg-gray-50 rounded-xl transition-colors ${className}`}
    >
      <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-base font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}
