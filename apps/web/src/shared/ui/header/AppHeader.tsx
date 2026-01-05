import Logo from '@/shared/icons/Logo';
import SearchIcon from '@/shared/icons/SearchIcon';
import type { AppHeaderProps } from '@/shared/types/header';
import AppHeaderTitle from './AppHeaderTitle';

export default function AppHeader({
  onLogoClick,
  onSearchClick,
  className = '',
}: AppHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between px-4 py-3 bg-white ${className}`}
    >
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="로고"
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Logo className="w-10 h-10" />
      </button>

      <AppHeaderTitle />

      <button
        type="button"
        onClick={onSearchClick}
        aria-label="검색"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <SearchIcon className="w-6 h-6 text-gray-700" />
      </button>
    </header>
  );
}
