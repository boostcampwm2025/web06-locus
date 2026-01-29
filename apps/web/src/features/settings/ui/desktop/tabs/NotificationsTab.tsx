import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BellIcon } from '@/shared/ui/icons/BellIcon';
import { ShieldIcon } from '@/shared/ui/icons/ShieldIcon';
import { ClockIcon } from '@/shared/ui/icons/ClockIcon';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { NotificationTimePicker } from './NotificationTimePicker';
import type { NotificationsTabProps } from '../../../types';

export function NotificationsTab({
  isNotificationEnabled,
  onNotificationToggle,
  isPushEnabled,
  onPushToggle,
  notificationTime,
  onNotificationTimeChange,
}: NotificationsTabProps) {
  const { isPWA } = useDeviceType();
  const [showPWAInfo, setShowPWAInfo] = useState(false);

  const handlePushNotificationClick = () => {
    if (!isPWA) {
      setShowPWAInfo(true);
      // 3초 후 자동으로 닫힘
      setTimeout(() => setShowPWAInfo(false), 3000);
    } else {
      onPushToggle(!isPushEnabled);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <header>
        <h1 className="text-4xl font-black text-gray-900 mb-4">알림 설정</h1>
        <p className="text-gray-500 text-lg">
          기록 습관을 위한 리마인더와 소식 알림을 설정하세요.
        </p>
      </header>

      <div className="space-y-6">
        <div
          className={`p-8 rounded-[40px] border-2 transition-all ${
            isNotificationEnabled
              ? 'border-orange-100 bg-orange-50/20'
              : 'border-gray-50 bg-gray-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-colors ${
                  isNotificationEnabled
                    ? 'bg-[#FE8916] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <BellIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  일일 기록 알림
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  매일 정해진 시간에 기록 작성을 위한 알림을 받습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNotificationToggle(!isNotificationEnabled)}
              className={`w-16 h-9 rounded-full relative p-1 transition-colors ${
                isNotificationEnabled ? 'bg-[#FE8916]' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: isNotificationEnabled ? 28 : 0 }}
                className="w-7 h-7 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <AnimatePresence>
            {isNotificationEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-orange-100 space-y-6">
                  {/* 푸시 알림 버튼 (단일 옵션) */}
                  <div className="relative">
                    <button
                      onClick={handlePushNotificationClick}
                      disabled={!isPWA}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all relative ${
                        isPushEnabled && isPWA
                          ? 'border-[#FE8916] bg-white shadow-sm'
                          : 'border-gray-100 bg-gray-50/50'
                      } ${!isPWA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isPushEnabled && isPWA
                              ? 'bg-orange-50 text-[#FE8916]'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <ShieldIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            isPushEnabled && isPWA
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          푸시 알림
                        </span>
                        {!isPWA && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-[#FE8916] text-[10px] font-black rounded-full">
                            PWA
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isPushEnabled && isPWA
                            ? 'bg-[#FE8916] border-[#FE8916]'
                            : 'border-gray-200'
                        }`}
                      >
                        {isPushEnabled && isPWA && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>

                    {/* PWA 안내 툴팁 */}
                    <AnimatePresence>
                      {showPWAInfo && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-2xl border-2 border-orange-100 shadow-lg z-10"
                        >
                          <p className="text-sm text-gray-700 leading-relaxed">
                            푸시 알림은 모바일 PWA 환경에서만 설정할 수 있어요.
                            <br />
                            스마트폰에 Locus를 추가해 더 가까운 기록 알림을
                            받아보세요.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 알림 시간 설정 */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-[#FE8916]">
                      <ClockIcon className="w-5 h-5" />
                      <span className="font-bold">알림 시간 설정</span>
                    </div>
                    <NotificationTimePicker
                      value={notificationTime}
                      onChange={onNotificationTimeChange}
                    />
                  </div>

                  {/* 데스크톱 환경 안내 문구 */}
                  {!isPWA && (
                    <div className="pt-4 border-t border-orange-100">
                      <p className="text-xs text-gray-400 text-center leading-relaxed">
                        모바일 기기에서 PWA로 접속하면 푸시 알림을 활성화할 수
                        있습니다.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
