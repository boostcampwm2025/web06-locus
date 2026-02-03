import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { MoreVerticalIcon } from '@/shared/ui/icons/MoreVerticalIcon';
import { IPhoneShareIcon } from '@/shared/ui/icons/IPhoneShareIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { LocusPinIcon } from '@/shared/ui/icons/LocusPinIcon';

/* --- 타입 정의 --- */
export interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

type PWAOS = 'ios' | 'android';

interface GuideStep {
  step: number;
  text: string;
  highlight: string;
  icon: React.ReactNode;
}

export function PWAInstallGuide({ isOpen, onClose }: PWAInstallGuideProps) {
  const [os, setOs] = React.useState<PWAOS>('ios');

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (userAgent.includes('android')) {
      setOs('android');
    }
  }, []);

  const guideContent: Record<'ios' | 'android', GuideStep[]> = {
    ios: [
      {
        step: 1,
        text: "브라우저 하단의 '공유하기' 버튼을 누르세요",
        highlight: '공유하기',
        icon: <IPhoneShareIcon className="size-5 text-[#2563eb]" />,
      },
      {
        step: 2,
        text: "메뉴에서 '홈 화면에 추가'를 선택하세요",
        highlight: '홈 화면에 추가',
        icon: <PlusIcon className="size-5 text-[#2563eb]" />,
      },
    ],
    android: [
      {
        step: 1,
        text: '우측 상단 세로 점 3개 메뉴를 클릭하세요',
        highlight: '세로 점 3개',
        icon: <MoreVerticalIcon className="size-5 text-[#2563eb]" />,
      },
      {
        step: 2,
        text: "'앱 설치' 또는 '홈 화면에 추가'를 선택하세요",
        highlight: '앱 설치',
        icon: <PlusIcon className="size-5 text-[#2563eb]" />,
      },
    ],
  };

  const steps = guideContent[os];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="pwa-install-guide"
          className="fixed inset-0 z-100 flex items-start justify-center pointer-events-none"
        >
          {/* Overlay: 배경 클릭 시 닫기 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 pointer-events-auto backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal Container: 위에서 아래로 내려오는 모션 */}
          <motion.div
            initial={{ y: -300 }}
            animate={{ y: 0 }}
            exit={{ y: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[393px] bg-white rounded-b-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.05)] pointer-events-auto border-b border-slate-100/50 overflow-hidden"
            role="dialog"
            aria-labelledby="pwa-install-title"
            aria-modal="true"
          >
            <div className="pt-10 pb-6 px-6">
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-[#2563eb] rounded-xl flex items-center justify-center">
                    <LocusPinIcon className="size-5 text-white" />
                  </div>
                  <div>
                    <p
                      id="pwa-install-title"
                      className="text-[17px] font-bold text-[#1e293b] tracking-tight"
                    >
                      앱 설치 가이드
                    </p>
                    <p className="text-[12px] text-[#2563eb] font-medium">
                      Locus를 앱으로 더 편하게
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <XIcon className="size-5 text-slate-300" />
                </button>
              </div>

              {/* OS Switch */}
              <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOs('ios')}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${os === 'ios' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-400'}`}
                >
                  iOS (Safari)
                </button>
                <button
                  type="button"
                  onClick={() => setOs('android')}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${os === 'android' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-400'}`}
                >
                  Android (Chrome)
                </button>
              </div>

              {/* Guide Steps */}
              <div className="space-y-3">
                {steps.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50"
                  >
                    <div className="size-10 shrink-0 bg-white rounded-xl flex items-center justify-center text-[#2563eb] shadow-sm border border-slate-100">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider mb-0.5">
                        Step 0{item.step}
                      </p>
                      <p className="text-[14px] font-medium text-slate-700 leading-snug">
                        {item.text.split(item.highlight).map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className="text-slate-900 font-bold underline underline-offset-4 decoration-blue-200">
                                {item.highlight}
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Tip */}
              <p className="mt-6 text-center text-[11px] text-slate-400">
                설치 후 홈 화면에서 바로 접속할 수 있습니다.
              </p>
            </div>

            {/* Bottom Accent Decor */}
            <div className="h-1 w-8 bg-slate-100 rounded-full mx-auto mb-2" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
