import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/shared/icons/Logo';
import SearchIcon from '@/shared/icons/SearchIcon';
import FilterIcon from '@/shared/icons/FilterIcon';
import type { AppHeaderNormalModeProps } from '@/shared/types/header';
import AppHeaderTitle from './AppHeaderTitle';
import { ROUTES } from '@/router/routes';

/**
 * 일반 모드 헤더 컴포넌트
 * 로고, 제목, 필터 버튼, 검색 버튼을 표시합니다.
 */
export default function AppHeaderNormalMode({
  onLogoClick,
  onTitleClick,
  onSearchClick,
  onFilterClick,
  className = '',
}: AppHeaderNormalModeProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      // 기본 동작: 온보딩으로 이동 (현재 경로를 state로 전달하여 돌아옴)
      void navigate(ROUTES.ONBOARDING, {
        state: { returnPath: location.pathname },
      });
    }
  };

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 bg-white min-h-[72px] ${className}`}
    >
      <button
        type="button"
        onClick={handleLogoClick}
        aria-label="로고"
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Logo className="w-10 h-10" />
      </button>

      <AppHeaderTitle onClick={onTitleClick} />

      <div className="flex items-center gap-2">
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            aria-label="필터"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FilterIcon className="w-6 h-6 text-gray-700" />
          </button>
        )}

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="검색"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <SearchIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}
