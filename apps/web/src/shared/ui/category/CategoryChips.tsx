import { useState } from 'react';
import CategoryChip from './CategoryChip';
import type { Category, CategoryChipsProps } from '@/shared/types/category';

const defaultCategories: Category[] = [
  { id: 'all', label: '전체' },
  { id: 'history', label: '역사' },
  { id: 'culture', label: '문화' },
  { id: 'attraction', label: '명소' },
  { id: 'nature', label: '자연' },
];

export default function CategoryChips({
  categories = defaultCategories,
  defaultSelectedId,
  onCategoryChange,
  className = '',
}: CategoryChipsProps) {
  const initialSelectedId =
    defaultSelectedId ?? (categories.length > 0 ? categories[0].id : '');
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedId(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div
      className={`flex gap-2 overflow-x-auto px-4 py-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          label={category.label}
          isSelected={selectedId === category.id}
          onClick={() => {
            handleCategoryClick(category.id);
          }}
        />
      ))}
    </div>
  );
}
