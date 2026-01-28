import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import type { BackHeaderProps } from '@/shared/types/header';

/**
 * 뒤로가기 버튼과 제목이 있는 헤더 컴포넌트
 */
export default function BackHeader({
  title,
  onBack,
  className = '',
}: BackHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100 ${className}`}
    >
      <button
        type="button"
        onClick={onBack}
        className="p-1 -ml-1 hover:bg-gray-100 rounded transition-colors"
        aria-label="뒤로 가기"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
      </button>
      <h1 className="text-lg font-medium text-gray-900">{title}</h1>
    </header>
  );
}
