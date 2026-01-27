import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ClockIcon } from '@/shared/ui/icons/ClockIcon';

const ITEM_HEIGHT = 42;
const PADDING_HEIGHT = 40;

interface NotificationTimePickerProps {
  value: string; // "HH:mm" 형식
  onChange: (time: string) => void;
}

/**
 * 알림 시간 선택 컴포넌트
 */
export function NotificationTimePicker({
  value,
  onChange,
}: NotificationTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });

  // "HH:mm" 형식을 파싱
  const [parsedHours, parsedMinutes] = useMemo(
    () => value.split(':').map(Number),
    [value],
  );

  // 내부 상태 관리 (사용자 선택 반영)
  const [selectedHour, setSelectedHour] = useState(parsedHours || 19);
  const [selectedMinute, setSelectedMinute] = useState(parsedMinutes || 0);

  // value prop이 변경되면 내부 상태 동기화
  useEffect(() => {
    if (parsedHours !== undefined && parsedMinutes !== undefined) {
      setSelectedHour(parsedHours);
      setSelectedMinute(parsedMinutes);
    }
  }, [parsedHours, parsedMinutes]);

  // 시간 옵션 생성
  const hoursList = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutesList = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    [],
  );

  // 시간 포맷팅 헬퍼
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 버튼 위치 계산
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: buttonRect.bottom + 8, // mt-2 = 8px
        right: window.innerWidth - buttonRect.right,
      });
    }
  }, [isOpen]);

  // 패널이 열릴 때 선택된 값으로 스크롤
  const syncScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
    delay: number,
  ) => {
    setTimeout(() => {
      if (ref.current) {
        const selectedElement = ref.current.children[index + 1] as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          });
        }
      }
    }, delay);
  };

  useEffect(() => {
    if (isOpen) {
      syncScroll(hourScrollRef, selectedHour, 100);
      syncScroll(minuteScrollRef, selectedMinute, 150);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 시간/분 변경 시 부모에 전달
  useEffect(() => {
    const timeString = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange(timeString);
  }, [selectedHour, selectedMinute, onChange]);

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-300 bg-white rounded-[24px] shadow-[0px_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 p-4 w-[300px]"
          style={{
            top: `${panelPosition.top}px`,
            right: `${panelPosition.right}px`,
          }}
        >
          <div className="flex items-start justify-center gap-6">
            <ScrollColumn
              label="시간"
              list={hoursList}
              selected={selectedHour}
              onSelect={setSelectedHour}
              scrollRef={hourScrollRef}
            />

            <div className="text-2xl font-black text-gray-300 mt-10">:</div>

            <ScrollColumn
              label="분"
              list={minutesList}
              selected={selectedMinute}
              onSelect={setSelectedMinute}
              scrollRef={minuteScrollRef}
            />
          </div>

          {/* 선택된 시간 미리보기 */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-1">선택된 시간</p>
            <p className="text-sm font-black text-gray-900">
              {formatTime(selectedHour, selectedMinute)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border-none rounded-xl px-6 py-3 font-black text-gray-900 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-orange-100 outline-none"
        >
          <ClockIcon className="w-5 h-5 text-[#FE8916]" />
          <span>{formatTime(selectedHour, selectedMinute)}</span>
        </button>
      </div>
      {typeof document !== 'undefined' &&
        createPortal(panelContent, document.body)}
    </>
  );
}

/**
 * 스크롤 가능한 시간/분 선택 컬럼 컴포넌트
 */
function ScrollColumn({
  label,
  list,
  selected,
  onSelect,
  scrollRef,
}: {
  label: string;
  list: number[];
  selected: number;
  onSelect: (val: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const handleItemClick = (item: number) => {
    onSelect(item);
    // 선택된 항목으로 스크롤
    const element = scrollRef.current?.children[item + 1] as HTMLElement;
    element?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
        {label}
      </span>
      <div className="relative">
        {/* 상단 그라데이션 */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-white via-white/80 to-transparent pointer-events-none z-10 rounded-t-[24px]" />
        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-b from-transparent via-white/80 to-white pointer-events-none z-10 rounded-b-[24px]" />
        <div
          ref={scrollRef}
          className="h-[126px] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#f3f4f6 transparent',
          }}
        >
          {/* 상단 패딩 (중앙 정렬용) */}
          <div style={{ height: `${PADDING_HEIGHT}px` }} />
          {list.map((item) => (
            <div
              key={item}
              className="snap-center"
              style={{ height: `${ITEM_HEIGHT}px` }}
            >
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-16 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                    selected === item
                      ? 'bg-[#FE8916] text-white shadow-sm scale-110'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {String(item).padStart(2, '0')}
                </button>
              </div>
            </div>
          ))}
          {/* 하단 패딩 (중앙 정렬용) */}
          <div style={{ height: `${PADDING_HEIGHT}px` }} />
        </div>
      </div>
    </div>
  );
}
