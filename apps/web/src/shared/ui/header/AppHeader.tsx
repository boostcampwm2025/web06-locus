import type { AppHeaderProps } from '@/shared/types/header';
import { useSearchInput } from '@/shared/hooks/useSearchInput';
import AppHeaderSearchMode from './AppHeaderSearchMode';
import AppHeaderNormalMode from './AppHeaderNormalMode';

/**
 * 앱 헤더 컴포넌트
 * 검색 모드와 일반 모드를 지원하며, Controlled/Uncontrolled 패턴을 모두 지원합니다.
 */
export default function AppHeader({
  onLogoClick,
  onSearchClick,
  onFilterClick,
  isSearchActive = false,
  searchPlaceholder = '키워드, 장소, 태그 검색',
  searchValue,
  onSearchChange,
  onSearchCancel,
  className = '',
}: AppHeaderProps) {
  const searchInput = useSearchInput({
    value: searchValue,
    onChange: onSearchChange,
    onCancel: onSearchCancel,
  });

  if (isSearchActive) {
    return (
      <AppHeaderSearchMode
        value={searchInput.value}
        onChange={searchInput.onChange}
        onCancel={searchInput.onCancel}
        placeholder={searchPlaceholder}
        className={className}
      />
    );
  }

  return (
    <AppHeaderNormalMode
      onLogoClick={onLogoClick}
      onSearchClick={onSearchClick}
      onFilterClick={onFilterClick}
      className={className}
    />
  );
}
