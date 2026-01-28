import { useState } from 'react';
import { motion } from 'motion/react';
import { Toggle } from '../components/Toggle';
import { TimePickerModal } from '../modals/TimePickerModal';
import { BackArrowIcon } from '@/shared/ui/icons/BackArrowIcon';
import { ClockIconMobile } from '@/shared/ui/icons/ClockIconMobile';
import { BellIconMobile } from '@/shared/ui/icons/BellIconMobile';
import {
  parseTimeString,
  formatDisplayTime,
  formatTimeString,
} from '@features/settings/utils/timeUtils';
import type { NotificationsTabProps } from '@features/settings/types';

interface NotificationsTabMobileProps extends NotificationsTabProps {
  onBack: () => void;
}

/**
 * 모바일 알림 설정 탭
 */
export function NotificationsTabMobile({
  onBack,
  isNotificationEnabled,
  onNotificationToggle,
  isPushEnabled,
  onPushToggle,
  notificationTime,
  onNotificationTimeChange,
}: NotificationsTabMobileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedTime = parseTimeString(notificationTime);

  const handleSaveTime = (time: { hour: number; minute: number }) => {
    const timeString = formatTimeString(time.hour, time.minute);
    onNotificationTimeChange(timeString);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 z-10 bg-white flex flex-col"
      >
        <header className="flex h-[80px] items-center px-6 shrink-0">
          <button
            onClick={onBack}
            className="flex size-11 items-center justify-center rounded-2xl bg-[#f8fafc] transition-colors hover:bg-[#f1f3f5] active:scale-95"
          >
            <BackArrowIcon className="size-6 text-[#364153]" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-bold text-[#1a1c1e]">
            알림 설정
          </h1>
        </header>
        <main className="flex flex-col flex-1 overflow-y-auto">
          <section className="flex flex-col border-b border-[#f3f4f6] p-7 pb-9">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="font-['Inter:SemiBold','Noto_Sans_KR:SemiBold',sans-serif] text-[17px] font-semibold text-[#364153]">
                일일 기록 알림
              </h2>
              <Toggle
                enabled={isNotificationEnabled}
                onChange={onNotificationToggle}
              />
            </div>
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] leading-relaxed text-[#99a1af]">
              매일 정해진 시간에 기록을 작성하도록 알림을 받습니다
            </p>
          </section>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex h-[80px] items-center justify-between border-b border-[#f3f4f6] px-7 transition-colors hover:bg-[#f8fafc] active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                <ClockIconMobile className="size-6 text-[#60a5fa]" />
              </div>
              <span className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-[#364153]">
                알림 시간
              </span>
            </div>
            <span className="font-['Inter:SemiBold','Noto_Sans_KR:SemiBold',sans-serif] text-[17px] font-semibold text-[#60a5fa]">
              {formatDisplayTime(selectedTime.hour, selectedTime.minute)}
            </span>
          </button>
          <div className="p-7">
            <div className="rounded-2xl bg-[#f8fafc] p-5">
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] leading-relaxed text-[#99a1af]">
                알림을 활성화하면 매일 설정한 시간에 기록 작성을 위한 푸시
                알림을 받게 됩니다. 알림은 기기의 시스템 설정에서도 관리할 수
                있습니다.
              </p>
            </div>
          </div>
          <div className="h-2 bg-[#f3f4f6]/40" />
          <section className="p-7">
            <h3 className="mb-6 font-['Inter:Bold',sans-serif] text-[12px] font-bold tracking-[1.5px] text-[#99a1af] uppercase">
              Notification Types
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl border-2 border-[#f3f4f6] bg-white text-[#4A5565]">
                    <BellIconMobile className="size-6" />
                  </div>
                  <span className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-[#364153]">
                    푸시 알림
                  </span>
                </div>
                <Toggle enabled={isPushEnabled} onChange={onPushToggle} />
              </div>
            </div>
          </section>
        </main>
      </motion.div>
      <TimePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTime={selectedTime}
        onSave={handleSaveTime}
      />
    </>
  );
}
