import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { XIcon, CheckIcon } from '@/shared/icons/Icons';
import type { FilterBottomSheetProps } from '@/features/record/types';

export default function FilterBottomSheet({
  isOpen,
  onClose,
  sortOrder = 'newest',
  includeImages = false,
  favoritesOnly = false,
  onSortOrderChange,
  onIncludeImagesChange,
  onFavoritesOnlyChange,
  onApply,
}: FilterBottomSheetProps) {
  const handleApply = () => {
    onApply?.();
    onClose();
  };

  return (
    <BaseBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="filter"
      showHandle={true}
    >
      <div className="flex flex-col h-full">
        <FilterHeader onClose={onClose} />

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* 정렬 기준 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              정렬 기준
            </h3>
            <div className="space-y-2">
              <FilterSortOption
                label="최신순"
                isSelected={sortOrder === 'newest'}
                onClick={() => onSortOrderChange?.('newest')}
              />
              <FilterSortOption
                label="오래된순"
                isSelected={sortOrder === 'oldest'}
                onClick={() => onSortOrderChange?.('oldest')}
              />
            </div>
          </div>

          {/* 콘텐츠 옵션 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              콘텐츠 옵션
            </h3>
            <div className="space-y-2">
              <FilterCheckboxOption
                label="이미지 포함"
                isChecked={includeImages}
                onClick={() => onIncludeImagesChange?.(!includeImages)}
              />
              <FilterCheckboxOption
                label="즐겨찾기만 보기"
                isChecked={favoritesOnly}
                onClick={() => onFavoritesOnlyChange?.(!favoritesOnly)}
              />
            </div>
          </div>
        </div>

        <FilterApplyButton onClick={handleApply} />
      </div>
    </BaseBottomSheet>
  );
}

/**
 * 필터 헤더 컴포넌트
 */
function FilterHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">필터 설정</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <XIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

/**
 * 정렬 옵션 버튼 컴포넌트
 */
function FilterSortOption({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-lg
        transition-colors text-left
        ${
          isSelected
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }
      `}
    >
      <span className="text-sm">{label}</span>
      {isSelected && <CheckIcon className="w-5 h-5 text-gray-700" />}
    </button>
  );
}

/**
 * 체크박스 옵션 버튼 컴포넌트
 */
function FilterCheckboxOption({
  label,
  isChecked,
  onClick,
}: {
  label: string;
  isChecked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left"
    >
      <span className="text-sm">{label}</span>
      <div
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center
          transition-colors
          ${
            isChecked
              ? 'bg-gray-900 border-gray-900'
              : 'bg-white border-gray-300'
          }
        `}
      >
        {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
      </div>
    </button>
  );
}

/**
 * 필터 적용 버튼 컴포넌트
 */
function FilterApplyButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="px-6 pt-4 pb-6 border-t border-gray-100">
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        적용
      </button>
    </div>
  );
}
