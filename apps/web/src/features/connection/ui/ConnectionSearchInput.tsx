import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import type { ConnectionSearchInputProps } from '../types/connectionManagement';

/**
 * 연결 검색 입력 컴포넌트
 */
export default function ConnectionSearchInput({
  value,
  onChange,
  placeholder = '연결된 기록 검색',
  className = '',
}: ConnectionSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      {/* 검색 아이콘 */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="연결 기록 검색"
        className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm transition-all"
      />

      {/* 값이 있을 때만 보여주는 삭제 버튼 (선택 사항) */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
          title="검색어 초기화"
        >
          {/* 여기에 X 아이콘 (예: CloseIcon) 을 넣으면 좋습니다 */}
          <span className="sr-only">초기화</span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
