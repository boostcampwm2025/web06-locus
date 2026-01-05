export interface Category {
  id: string;
  label: string;
}

export interface CategoryChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CategoryChipsProps {
  categories?: Category[];
  defaultSelectedId?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}
