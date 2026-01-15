import { useRef } from 'react';
import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import type {
  RecordSelectionContextSheetProps,
  ActionItemProps,
} from '../types/recordConnection';

/**
 * 기록 선택 컨텍스트 바텀시트
 * 첫 번째 기록 클릭 시 출발/도착 선택 메뉴를 표시합니다.
 */
export default function RecordSelectionContextSheet({
  isOpen,
  onClose,
  record,
  onSelectDeparture,
  onSelectArrival,
}: RecordSelectionContextSheetProps) {
  const isHandlingRef = useRef(false);

  if (!record) return null;

  const handleSelect = (type: 'departure' | 'arrival') => {
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;

    if (type === 'departure') onSelectDeparture(record);
    else onSelectArrival(record);

    onClose();

    // 시트 닫힘 애니메이션 동안 연타 방지용
    window.setTimeout(() => {
      isHandlingRef.current = false;
    }, 300);
  };

  return (
    <BaseBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="connection"
      showHandle
    >
      <div className="px-6 py-5">
        <div className="mb-5">
          <h3 className="text-lg font-normal text-gray-900 mb-1.5">
            기록 선택
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {record.title}
          </p>
        </div>

        <div className="space-y-3">
          <ActionItem
            dotClassName="bg-green-500"
            title="출발"
            description="이 기록을 출발지로 선택"
            ariaLabel="이 기록을 출발지로 선택"
            onClick={() => handleSelect('departure')}
          />

          <ActionItem
            dotClassName="bg-red-500"
            title="도착"
            description="이 기록을 도착지로 선택"
            ariaLabel="이 기록을 도착지로 선택"
            onClick={() => handleSelect('arrival')}
          />
        </div>
      </div>
    </BaseBottomSheet>
  );
}

function ActionItem({
  dotClassName,
  title,
  description,
  onClick,
  ariaLabel,
}: ActionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 text-left shadow-sm hover:shadow-md"
    >
      <div
        className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${dotClassName}`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium text-gray-900 mb-0.5">
          {title}
        </div>
        <div className="text-xs text-gray-500 leading-relaxed">
          {description}
        </div>
      </div>
    </button>
  );
}
