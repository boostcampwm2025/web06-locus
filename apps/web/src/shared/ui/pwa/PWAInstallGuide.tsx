import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShareIcon } from '@/shared/ui/icons/ShareIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { MoreVerticalIcon } from '@/shared/ui/icons/MoreVerticalIcon';
import { DownloadIcon } from '@/shared/ui/icons/DownloadIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { LocusPinIcon } from '@/shared/ui/icons/LocusPinIcon';

/* --- 타입 정의 --- */
export interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

type PWAOS = 'ios' | 'android' | 'other';

interface StepProps {
  step: number;
  title: string;
  icon: React.ReactNode;
}

export function PWAInstallGuide({ isOpen, onClose }: PWAInstallGuideProps) {
  const [os, setOs] = React.useState<PWAOS>('other');

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (userAgent.includes('android')) {
      setOs('android');
    }
  }, []);

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
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-[#2563eb] rounded-xl flex items-center justify-center">
                    <LocusPinIcon className="size-5 text-white" />
                  </div>
                  <p
                    id="pwa-install-title"
                    className="text-[17px] font-bold text-[#1e293b] tracking-tight"
                  >
                    Locus 앱 설치안내
                  </p>
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

              {/* Guide Content: OS에 따라 가이드 교체 */}
              <div className="min-h-[120px]">
                {os === 'ios' ? <IOSGuide /> : <AndroidGuide />}
              </div>
            </div>

            {/* Bottom Accent Decor */}
            <div className="h-1 w-8 bg-slate-100 rounded-full mx-auto mb-2" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const InstallStep = ({ step, title, icon }: StepProps) => (
  <div className="flex items-center gap-4 group">
    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#2563eb]/20 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[14px] text-slate-500 leading-tight mb-0.5">
        Step {step}
      </p>
      <p className="text-[15px] font-semibold text-slate-800">{title}</p>
    </div>
  </div>
);

const IOSGuide = () => (
  <div className="space-y-4">
    <InstallStep
      step={1}
      title="브라우저 하단 공유하기 버튼 클릭"
      icon={<ShareIcon className="size-5 text-slate-600" />}
    />
    <InstallStep
      step={2}
      title="홈 화면에 추가 메뉴 선택"
      icon={<PlusIcon className="size-5 text-slate-600" />}
    />
  </div>
);

const AndroidGuide = () => (
  <div className="space-y-4">
    <InstallStep
      step={1}
      title="브라우저 메뉴(세로 점 3개) 클릭"
      icon={<MoreVerticalIcon className="size-5 text-slate-600" />}
    />
    <InstallStep
      step={2}
      title="앱 설치 또는 홈 화면에 추가 선택"
      icon={<DownloadIcon className="size-5 text-slate-600" />}
    />
  </div>
);
