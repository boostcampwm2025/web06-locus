import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { DesktopCalendar } from './DesktopCalendar';
import type {
  DesktopFilterPanelProps,
  FilterFieldProps,
  SortOrderButtonProps,
} from '@/shared/types';

export function DesktopFilterPanel({
  sortOrder = 'newest',
  startDate = '',
  endDate = '',
  onSortOrderChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: DesktopFilterPanelProps) {
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(
    null,
  );

  const handleReset = () => {
    onSortOrderChange?.('newest');
    onStartDateChange?.('');
    onEndDateChange?.('');
    onReset?.();
  };

  return (
    <div className="w-[256px] bg-white rounded-[16px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] border border-[#f3f4f6] p-[17px] font-['Inter','Noto_Sans_KR',sans-serif]">
      {/* 정렬 순서 Section */}
      <div className="mb-4">
        <p className="text-[#99a1af] text-[10px] font-black tracking-[1.1172px] uppercase mb-2 leading-[15px]">
          정렬 순서
        </p>
        <div className="grid grid-cols-2 gap-2 h-[32px]">
          <SortOrderButton
            label="최신순"
            isSelected={sortOrder === 'newest'}
            onClick={() => onSortOrderChange?.('newest')}
          />
          <SortOrderButton
            label="오래된순"
            isSelected={sortOrder === 'oldest'}
            onClick={() => onSortOrderChange?.('oldest')}
          />
        </div>
      </div>

      {/* 기간 선택 Section */}
      <div className="mb-4">
        <p className="text-[#99a1af] text-[10px] font-black tracking-[1.1172px] uppercase mb-2 leading-[15px]">
          기간 선택
        </p>

        <FilterField
          label="시작일"
          value={startDate}
          isActive={activePicker === 'start'}
          onClick={() =>
            setActivePicker(activePicker === 'start' ? null : 'start')
          }
          selectedDate={startDate}
          onSelect={(date) => {
            // 시작일이 종료일보다 늦으면: 종료일을 시작일로 두고 종료일은 비움
            if (endDate && date > endDate) {
              onStartDateChange?.(endDate);
              onEndDateChange?.('');
            } else {
              onStartDateChange?.(date);
            }
            setActivePicker(null);
          }}
          onClose={() => setActivePicker(null)}
        />

        <div className="relative">
          <FilterField
            label="종료일"
            value={endDate}
            isActive={activePicker === 'end'}
            onClick={() =>
              setActivePicker(activePicker === 'end' ? null : 'end')
            }
            selectedDate={endDate}
            onSelect={(date) => {
              // 종료일이 시작일보다 이전이면: 찍은 날짜를 시작일로, 종료일은 비움
              if (startDate && date < startDate) {
                onStartDateChange?.(date);
                onEndDateChange?.('');
              } else {
                onEndDateChange?.(date);
              }
              setActivePicker(null);
            }}
            onClose={() => setActivePicker(null)}
          />
        </div>
      </div>

      {/* 초기화 버튼 */}
      <button
        type="button"
        onClick={handleReset}
        className="w-full h-[31px] flex items-center justify-center text-[#99a1af] text-[10px] font-bold tracking-[0.1172px] hover:text-[#73c92e] transition-colors cursor-pointer"
      >
        필터 초기화
      </button>
    </div>
  );
}

function SortOrderButton({ label, isSelected, onClick }: SortOrderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-[14px] text-[12px] font-bold transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'bg-[#FE8916] text-white shadow-[0px_4px_6px_0px_#dbeafe,0px_2px_4px_0px_#dbeafe]'
            : 'bg-[#f9fafb] text-[#6a7282]'
        }
      `}
    >
      {label}
    </button>
  );
}

function FilterField({
  label,
  value,
  isActive,
  onClick,
  selectedDate,
  onSelect,
  onClose,
}: FilterFieldProps) {
  return (
    <div className="mb-2 relative">
      <label className="text-[#99a1af] text-[10px] block px-[4px] mb-1 tracking-[0.1172px] leading-[15px]">
        {label}
      </label>
      <button
        type="button"
        onClick={onClick}
        className={`w-full h-[32px] bg-[#f9fafb] rounded-[14px] px-3 flex items-center justify-between text-[11px] font-medium transition-all cursor-pointer
          ${value ? 'text-[#73c92e]' : 'text-[#6a7282]/50'}
          ${
            isActive
              ? 'ring-1 ring-[#155dfc]/30 shadow-[0px_2px_10px_rgba(21,93,252,0.1)]'
              : ''
          }
        `}
      >
        <span>{value || 'YYYY-MM-DD'}</span>
        <CalendarIcon className="w-3.5 h-3.5 text-[#99a1af]" />
      </button>
      <AnimatePresence>
        {isActive && (
          <DesktopCalendar
            selectedDate={selectedDate}
            onSelect={onSelect}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
