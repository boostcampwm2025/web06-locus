export interface AppHeaderProps {
  onLogoClick?: () => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  className?: string;
}

export interface AppHeaderTitleProps {
  isOnline?: boolean;
  className?: string;
}
