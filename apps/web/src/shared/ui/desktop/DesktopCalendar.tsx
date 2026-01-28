import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeftIcon } from '@/shared/ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import type { DesktopCalendarProps } from '@/shared/types';

export function DesktopCalendar({
  selectedDate,
  onSelect,
  onClose,
}: DesktopCalendarProps) {
  const [currentDate, setCurrentDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date(),
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthPadding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return (
      d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <motion.div
      ref={calendarRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.1)] border border-[#f3f4f6] p-4 w-[240px]"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-[#f9fafb] rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-[#99a1af]" />
        </button>
        <span className="text-[12px] font-bold text-[#FE8916] font-['Inter',sans-serif]">
          {year}년 {month + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-[#f9fafb] rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-[#99a1af]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <span
            key={d}
            className={`text-[10px] font-bold ${
              i === 0
                ? 'text-red-400'
                : i === 6
                  ? 'text-[#FE8916]'
                  : 'text-[#99a1af]'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {prevMonthPadding.map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={`h-7 w-7 flex items-center justify-center text-[11px] rounded-[8px] transition-all
              ${
                isSelected(day)
                  ? 'bg-[#FE8916] text-white font-bold shadow-[0px_2px_4px_rgba(21,93,252,0.3)]'
                  : isToday(day)
                    ? 'bg-[#f9fafb] text-[#FE8916] font-bold border border-[#155dfc]/20'
                    : 'text-[#6a7282] hover:bg-[#f9fafb]'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
