import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomSelect } from '../components/CustomSelect';
import {
  formatDisplayTime,
  HOURS,
  MINUTES,
} from '@features/settings/utils/timeUtils';
import type { TimePickerModalProps } from '@features/settings/types';

/**
 * 모바일 알림 시간 선택 모달
 */
export function TimePickerModal({
  isOpen,
  onClose,
  initialTime,
  onSave,
}: TimePickerModalProps) {
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);

  useEffect(() => {
    if (isOpen) {
      setHour(initialTime.hour);
      setMinute(initialTime.minute);
    }
  }, [isOpen, initialTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-[rgba(0,0,0,0.4)] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 z-61 rounded-t-[32px] bg-white p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
          >
            <div className="mx-auto mb-8 h-[5px] w-12 rounded-full bg-[#f1f3f5]" />
            <div className="mb-10 text-center">
              <h2 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[22px] font-bold tracking-tight text-[#1a1c1e]">
                알림 시간 설정
              </h2>
              <p className="mt-2 font-['Inter:Regular',sans-serif] text-[15px] text-[#99a1af]">
                {formatDisplayTime(hour, minute)}
              </p>
            </div>
            <div className="mb-12 flex items-center justify-center gap-6">
              <CustomSelect
                label="Hour"
                value={hour}
                options={HOURS}
                onChange={setHour}
              />
              <span className="font-['Inter:Medium',sans-serif] text-[24px] font-medium text-[#cbd5e1] animate-pulse">
                :
              </span>
              <CustomSelect
                label="Minute"
                value={minute}
                options={MINUTES}
                onChange={setMinute}
              />
            </div>
            <button
              onClick={() => onSave({ hour, minute })}
              className="group relative h-[64px] w-full overflow-hidden rounded-[20px] bg-[#60a5fa] font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[18px] font-bold text-white shadow-[0_8px_20px_rgba(96,165,250,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10">저장하기</span>
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
