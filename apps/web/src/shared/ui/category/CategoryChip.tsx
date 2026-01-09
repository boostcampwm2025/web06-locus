import type { CategoryChipProps } from '@/shared/types/category';

export default function CategoryChip({
  label,
  isSelected = false,
  onClick,
  className = '',
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start shrink-0
        ${
          isSelected
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}
