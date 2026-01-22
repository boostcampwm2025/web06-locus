export interface AppHeaderProps {
  onLogoClick?: () => void;
  onTitleClick?: () => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  // 검색 모드 관련 props
  isSearchActive?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchCancel?: () => void;
  onSearch?: (value: string) => void;
  className?: string;
}

export interface AppHeaderTitleProps {
  isOnline?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 검색 입력 훅 옵션
 */
export interface UseSearchInputOptions {
  value?: string;
  onChange?: (value: string) => void;
  onCancel?: () => void;
}

/**
 * 검색 입력 훅 반환 타입
 */
export interface UseSearchInputReturn {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}

/**
 * 검색 모드 헤더 컴포넌트 Props
 */
export interface AppHeaderSearchModeProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSearch?: (value: string) => void;
  placeholder: string;
  className?: string;
}

/**
 * 일반 모드 헤더 컴포넌트 Props
 */
export interface AppHeaderNormalModeProps {
  onLogoClick?: () => void;
  onTitleClick?: () => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  className?: string;
}

/**
 * 인증 페이지 헤더 컴포넌트 Props
 */
export interface AuthPageHeaderProps {
  title?: string;
  subtitle?: React.ReactNode;
}

/**
 * 뒤로가기 헤더 컴포넌트 Props
 */
export interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}
