import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import type { AppHeaderSearchModeProps } from '@/shared/types/header';

/**
 * 검색 모드 헤더 컴포넌트
 * 검색 입력창과 취소 버튼을 표시합니다.
 */
export default function AppHeaderSearchMode({
  value,
  onChange,
  onCancel,
  onSearch,
  placeholder,
  className = '',
}: AppHeaderSearchModeProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim().length > 0) {
      onSearch?.(value.trim());
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-white min-h-[72px] ${className}`}
    >
      <div className="flex-1 flex items-center gap-3 bg-transparent rounded-lg px-3 h-12">
        <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-400 min-w-0"
          autoFocus
        />
      </div>
      <button
        type="button"
        onClick={onCancel}
        aria-label="취소"
        className="text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors shrink-0"
      >
        취소
      </button>
    </header>
  );
}
