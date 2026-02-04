import { useState } from 'react';
import { motion } from 'motion/react';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import { MaximizeIcon } from '@/shared/ui/icons/MaximizeIcon';
import { IPhoneShareIcon } from '@/shared/ui/icons/IPhoneShareIcon';
import { MoreVerticalIcon } from '@/shared/ui/icons/MoreVerticalIcon';
import { SmartphoneIcon } from '@/shared/ui/icons/SmartphoneIcon';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { Logo } from '@/shared/ui/icons/Logo';
import type { ProfileTabProps } from '../../../types';

type PwaOS = 'android' | 'ios';

/**
 * PWA 설치 안내 카드 (OS별 스텝 가이드 + 공유/더보기 SVG 아이콘)
 */
const PWAInstallGuide = () => {
  const [pwaOS, setPwaOS] = useState<PwaOS>('android');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 min-h-0 mb-16 md:mb-24"
    >
      <div className="relative bg-white border border-orange-100 rounded-[40px] p-6 md:p-8 group shadow-[0_20px_50px_rgba(254,137,22,0.05)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FE8916] text-white rounded-xl shadow-md shadow-orange-100">
                <MaximizeIcon className="size-3.5" strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Install App
                </span>
              </div>
              <h4 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                데스크톱 & 모바일 앱으로 더 넓게 보세요
              </h4>
              <p className="text-sm text-gray-500 font-medium max-w-xl">
                브라우저의 주소창이나 메뉴를 통해 앱을 설치할 수 있습니다.
              </p>
            </div>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setPwaOS('android')}
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${pwaOS === 'android' ? 'bg-white text-[#FE8916] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <SmartphoneIcon className="size-3.5" /> Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setPwaOS('ios')}
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${pwaOS === 'ios' ? 'bg-white text-[#FE8916] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <SmartphoneIcon className="size-3.5" /> iOS / Safari
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-orange-50/30 rounded-3xl p-6 md:p-8 border border-orange-50/50 relative overflow-hidden group/item">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-[#FE8916] group-hover/item:scale-110 transition-transform duration-500 pointer-events-none">
                {pwaOS === 'android' ? (
                  <div className="flex flex-col gap-2 scale-[5]">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                  </div>
                ) : (
                  <div className="scale-[4] origin-bottom-right">
                    <div className="w-6 h-6 border-2 border-current border-t-0 rounded-sm relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-current" />
                        <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-current -rotate-45 -mt-6" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black text-[#FE8916] uppercase tracking-widest mb-3 block">
                Step 01
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 border border-orange-100 text-gray-700">
                  {pwaOS === 'android' ? (
                    <MoreVerticalIcon className="size-5" />
                  ) : (
                    <IPhoneShareIcon className="size-5" />
                  )}
                </span>
                <h5 className="text-base md:text-lg font-black text-gray-900">
                  {pwaOS === 'android'
                    ? '브라우저 메뉴 열기'
                    : '공유 버튼 탭하기'}
                </h5>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {pwaOS === 'android'
                  ? '크롬 브라우저 우측 상단의 세로 점 3개 [︙] 버튼을 누르세요.'
                  : '사파리 브라우저 하단 중앙의 공유(내보내기) 아이콘을 누르세요.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden group/item">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-[#73C92E] group-hover/item:scale-110 transition-transform duration-500 pointer-events-none">
                <CheckIcon className="size-24 md:size-[120px]" />
              </div>
              <span className="text-[10px] font-black text-[#73C92E] uppercase tracking-widest mb-3 block">
                Step 02
              </span>
              <h5 className="text-base md:text-lg font-black text-gray-900 mb-2">
                {pwaOS === 'android' ? '앱 설치 또는 추가' : '홈 화면에 추가'}
              </h5>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {pwaOS === 'android'
                  ? "메뉴 항목 중 '앱 설치' 또는 '홈 화면에 추가'를 클릭하여 설치를 완료하세요."
                  : "리스트를 아래로 내려 '홈 화면에 추가' 버튼을 찾아 클릭하세요."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PROFILE_IMAGE_OPTIONS = [
  { bgGradient: 'from-orange-50 to-orange-100', iconColor: 'text-orange-500' },
  { bgGradient: 'from-green-50 to-green-100', iconColor: 'text-green-500' },
  { bgGradient: 'from-blue-50 to-blue-100', iconColor: 'text-blue-500' },
  { bgGradient: 'from-purple-50 to-purple-100', iconColor: 'text-purple-500' },
  { bgGradient: 'from-pink-50 to-pink-100', iconColor: 'text-pink-500' },
  { bgGradient: 'from-yellow-50 to-yellow-100', iconColor: 'text-yellow-500' },
  { bgGradient: 'from-indigo-50 to-indigo-100', iconColor: 'text-indigo-500' },
  { bgGradient: 'from-teal-50 to-teal-100', iconColor: 'text-teal-500' },
];

export function ProfileTab({ user, userLoading, userError }: ProfileTabProps) {
  // PWA 접속 여부 확인
  const { isPWA } = useDeviceType();

  // 닉네임을 시드로 사용하여 일관된 프로필 이미지 유지
  const displayName = user?.nickname ?? user?.email ?? '—';

  const [profileImageIndex, setProfileImageIndex] = useState(() =>
    getRandomProfileIndex(displayName),
  );
  const currentProfile = PROFILE_IMAGE_OPTIONS[profileImageIndex];

  const handleRandomizeProfile = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * PROFILE_IMAGE_OPTIONS.length);
    } while (newIndex === profileImageIndex);
    setProfileImageIndex(newIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 pb-8"
    >
      <header>
        <h1 className="text-4xl font-black text-gray-900 mb-4">프로필 정보</h1>
        <p className="text-gray-500 text-lg">
          기본 정보와 계정 보안을 관리하세요.
        </p>
      </header>

      <div className="space-y-10">
        {userError && (
          <p className="text-red-500 text-sm" role="alert">
            사용자 정보를 불러오지 못했습니다.
          </p>
        )}

        {/* 사용자 프로필 섹션 */}
        <section className="grid grid-cols-3 gap-8 items-start border-b border-gray-50 pb-10">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">사용자 프로필</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              이미지를 클릭하여 랜덤 변경
            </p>
          </div>
          <div className="col-span-2 flex items-center justify-between">
            <button
              onClick={handleRandomizeProfile}
              disabled={userLoading}
              className="w-24 h-24 rounded-[36px] overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70"
            >
              <div
                className={`w-full h-full bg-linear-to-br ${currentProfile.bgGradient} flex items-center justify-center`}
              >
                <UserIcon className={`w-10 h-10 ${currentProfile.iconColor}`} />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-black text-gray-700">
                  변경
                </span>
              </div>
            </button>

            <div className="flex flex-col gap-3">
              <div className="bg-orange-50 px-3 py-1 rounded-full self-start">
                <span className="text-[10px] font-bold text-[#FE8916]">
                  <Logo className="size-5" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 닉네임 섹션 */}
        <section className="grid grid-cols-3 gap-8 items-center border-b border-gray-50 pb-4">
          <h3 className="font-bold text-gray-900">닉네임</h3>
          <div className="col-span-2">
            <input
              type="text"
              value={user?.nickname ?? ''}
              placeholder={userLoading ? '불러오는 중…' : '닉네임'}
              readOnly
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-bold focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </section>

        {/* 이메일 섹션 */}
        <section className="grid grid-cols-3 gap-8 items-center">
          <h3 className="font-bold text-gray-900">이메일 주소</h3>
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-gray-500 font-medium">
              <span>
                {userLoading
                  ? '불러오는 중…'
                  : userError
                    ? '—'
                    : (user?.email ?? '—')}
              </span>
              {!userLoading && !userError && user?.email && (
                <CheckIcon className="w-[18px] h-[18px] text-[#73C92E]" />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* PWA가 아닐 때만 설치 안내 표시 */}
      {!isPWA && (
        <div className="mt-4 min-h-0">
          <PWAInstallGuide />
        </div>
      )}
    </motion.div>
  );
}

function getRandomProfileIndex(seed?: string): number {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % PROFILE_IMAGE_OPTIONS.length;
  }
  return Math.floor(Math.random() * PROFILE_IMAGE_OPTIONS.length);
}
