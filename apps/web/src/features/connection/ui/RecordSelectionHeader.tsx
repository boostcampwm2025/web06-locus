import { XIcon } from '@/shared/icons';
import type {
  RecordSelectionHeaderProps,
  SelectionButtonProps,
} from '../types/recordConnection';

/**
 * 출발/도착 기록 선택 헤더 컴포넌트
 */
export default function RecordSelectionHeader({
  departure,
  arrival,
  onDepartureClick,
  onArrivalClick,
  onDepartureClear,
  onArrivalClear,
  className = '',
}: RecordSelectionHeaderProps) {
  return (
    <div
      className={['flex gap-3 px-4 py-3', className].filter(Boolean).join(' ')}
    >
      <SelectionButton
        label="출발"
        placeholder="출발 기록 선택"
        dotClassName="bg-green-500"
        selected={departure}
        onClick={onDepartureClick}
        onClear={onDepartureClear}
        clearAriaLabel="출발 기록 취소"
      />

      <SelectionButton
        label="도착"
        placeholder="도착 기록 선택"
        dotClassName="bg-red-500"
        selected={arrival}
        onClick={onArrivalClick}
        onClear={onArrivalClear}
        clearAriaLabel="도착 기록 취소"
      />
    </div>
  );
}

function SelectionButton({
  label,
  placeholder,
  dotClassName,
  selected,
  onClick,
  onClear,
  clearAriaLabel,
}: SelectionButtonProps) {
  const isSelected = Boolean(selected);

  const containerClass = [
    'flex-1 flex items-center justify-between p-3 rounded-lg border-2 transition-colors min-w-0',
    isSelected
      ? 'border-gray-200 bg-gray-50'
      : 'border-gray-200 bg-white hover:border-gray-300',
  ].join(' ');

  const titleClass = [
    'text-sm font-medium truncate w-full block',
    isSelected ? 'text-gray-900' : 'text-gray-400',
  ].join(' ');

  return (
    <button type="button" onClick={onClick} className={containerClass}>
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? dotClassName : 'bg-gray-300'}`}
        />
        <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
          <span className="text-xs text-gray-500 mb-1 shrink-0">{label}</span>
          <span className={titleClass}>{selected?.title ?? placeholder}</span>
        </div>
      </div>

      {isSelected && onClear && (
        <span
          role="button"
          tabIndex={0}
          className="ml-2 shrink-0 inline-flex"
          aria-label={clearAriaLabel}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }
          }}
        >
          <XIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </span>
      )}
    </button>
  );
}
