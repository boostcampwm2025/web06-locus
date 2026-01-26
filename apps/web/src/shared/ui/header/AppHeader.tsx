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
  onTitleClick,
  onSearchClick,
  onFilterClick,
  onSettingsClick,
  isSearchActive = false,
  searchPlaceholder = '키워드, 장소, 태그 검색',
  searchValue,
  onSearchChange,
  onSearchCancel,
  onSearch,
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
        onSearch={onSearch}
        placeholder={searchPlaceholder}
        className={className}
      />
    );
  }

  return (
    <AppHeaderNormalMode
      onLogoClick={onLogoClick}
      onTitleClick={onTitleClick}
      onSearchClick={onSearchClick}
      onFilterClick={onFilterClick}
      onSettingsClick={onSettingsClick}
      className={className}
    />
  );
}
