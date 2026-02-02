import { useState } from 'react';
import { motion } from 'motion/react';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import { MaximizeIcon } from '@/shared/ui/icons/MaximizeIcon';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { Logo } from '@/shared/ui/icons/Logo';
import type { ProfileTabProps } from '../../../types';

/**
 * PWA 설치 안내 카드 (기존과 동일)
 */
const PWAInstallGuide = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden bg-[#FDFCFB] border border-orange-100 rounded-[32px] p-6 group shadow-sm"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/20 blur-3xl rounded-full -mr-16 -mt-16" />
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FE8916] text-white rounded-xl shadow-md shadow-orange-100">
          <MaximizeIcon className="size-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Install App
          </span>
        </div>
        <h4 className="text-xl font-black text-gray-900 tracking-tight">
          앱으로 설치해서 더 편리하게 쓰세요
        </h4>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
          브라우저 메뉴에서{' '}
          <span className="text-[#FE8916] font-black">'홈 화면에 추가'</span>를
          눌러보세요. 전용 앱 모드로 오직 기록에만 몰입할 수 있는 환경이
          구성됩니다.
        </p>
      </div>
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-orange-50 space-y-2.5 shrink-0 w-full md:w-auto min-w-[210px]">
        {[
          {
            icon: <CheckIcon className="size-3" />,
            text: '푸시 알림 리마인더 제공',
            color: 'bg-orange-50 text-[#FE8916]',
          },
          {
            icon: <CheckIcon className="size-3" />,
            text: '더 빠른 로딩 속도',
            color: 'bg-green-50 text-[#73C92E]',
          },
          {
            icon: <CheckIcon className="size-3" />,
            text: '전체 화면 몰입 모드 지원',
            color: 'bg-gray-50 text-gray-300',
          },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 ${item.color} rounded-lg flex items-center justify-center shrink-0`}
            >
              {item.icon}
            </div>
            <span className="text-[11px] font-bold text-gray-600">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

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

export function ProfileTab({
  onSave,
  user,
  userLoading,
  userError,
}: ProfileTabProps) {
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
      className="space-y-12"
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
              <button
                onClick={onSave}
                disabled={userLoading}
                className="px-6 py-3 bg-[#FE8916] text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                설정 저장하기
              </button>
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
        <div className="mt-4">
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
