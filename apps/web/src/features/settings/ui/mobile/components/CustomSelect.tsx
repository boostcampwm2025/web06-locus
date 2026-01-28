import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDownIcon } from '@/shared/ui/icons/ChevronDownIcon';
import { CheckIconMobile } from '@/shared/ui/icons/CheckIconMobile';
import type { CustomSelectProps } from '@features/settings/types';

/**
 * 모바일 설정용 커스텀 셀렉트 컴포넌트
 */
export function CustomSelect({
  value,
  options,
  onChange,
  label,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent,
    option: number,
    index: number,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(option);
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % options.length;
      const nextButton = listboxRef.current?.querySelector(
        `[data-option-index="${nextIndex}"]`,
      );
      (nextButton as HTMLElement)?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = index === 0 ? options.length - 1 : index - 1;
      const prevButton = listboxRef.current?.querySelector(
        `[data-option-index="${prevIndex}"]`,
      );
      (prevButton as HTMLElement)?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="group relative w-[100px]" ref={containerRef}>
      <div
        className={`pointer-events-none absolute -top-3 left-3 z-10 bg-white px-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
          isOpen ? 'text-[#60a5fa]' : 'text-[#99a1af]'
        }`}
      >
        {label}
      </div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label} 선택: 현재 값 ${value.toString().padStart(2, '0')}`}
        className={`flex h-[68px] w-full items-center justify-between rounded-[16px] border-2 bg-[#f8fafc] px-6 font-['Inter:Medium',sans-serif] text-[24px] font-medium text-[#364153] outline-none transition-all ${
          isOpen
            ? 'border-[#60a5fa] bg-white ring-4 ring-blue-50'
            : 'border-[#f3f4f6]'
        }`}
      >
        <span>{value.toString().padStart(2, '0')}</span>
        <ChevronDownIcon
          className={`size-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: isOpen ? '#60a5fa' : '#99A1AF' }}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listboxRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 z-50 mt-2 h-[120px] w-full overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
            role="listbox"
            aria-label={`${label} 옵션 목록`}
          >
            <div className="h-full overflow-y-auto py-2 custom-scrollbar">
              {options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  data-option-index={index}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                  className={`flex w-full items-center justify-between px-6 py-3 text-left font-['Inter:Medium',sans-serif] text-[18px] transition-colors ${
                    value === option
                      ? 'bg-blue-50 text-[#60a5fa]'
                      : 'text-[#364153] hover:bg-[#f8fafc]'
                  }`}
                >
                  <span>{option.toString().padStart(2, '0')}</span>
                  {value === option && (
                    <CheckIconMobile
                      className="size-5 text-[#60a5fa]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
