import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import type { RecordSearchInputProps } from '../types/recordConnection';

/**
 * 기록 검색 입력 컴포넌트
 * 페이지 내부에서 사용하는 검색 입력창입니다.
 */
export default function RecordSearchInput({
  value,
  onChange,
  placeholder = '기록 제목, 태그, 장소 검색...',
  className = '',
  autoFocus = false,
}: RecordSearchInputProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3 ${className}`}
    >
      <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="기록 검색"
        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
        autoFocus={autoFocus}
      />
    </div>
  );
}
