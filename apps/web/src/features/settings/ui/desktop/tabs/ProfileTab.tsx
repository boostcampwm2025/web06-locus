import { useState } from 'react';
import { motion } from 'motion/react';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import type { ProfileTabProps } from '../../../types';

/**
 * 프로필 이미지 옵션 타입
 */
interface ProfileImageOption {
  bgGradient: string;
  iconColor: string;
}

/**
 * 프로필 이미지 옵션 목록
 */
const PROFILE_IMAGE_OPTIONS: ProfileImageOption[] = [
  { bgGradient: 'from-orange-50 to-orange-100', iconColor: 'text-orange-500' },
  { bgGradient: 'from-green-50 to-green-100', iconColor: 'text-green-500' },
  { bgGradient: 'from-blue-50 to-blue-100', iconColor: 'text-blue-500' },
  { bgGradient: 'from-purple-50 to-purple-100', iconColor: 'text-purple-500' },
  { bgGradient: 'from-pink-50 to-pink-100', iconColor: 'text-pink-500' },
  { bgGradient: 'from-yellow-50 to-yellow-100', iconColor: 'text-yellow-500' },
  { bgGradient: 'from-indigo-50 to-indigo-100', iconColor: 'text-indigo-500' },
  { bgGradient: 'from-teal-50 to-teal-100', iconColor: 'text-teal-500' },
];

// TODO: api/me 연동
export function ProfileTab({ onSave }: ProfileTabProps) {
  // 닉네임을 시드로 사용하여 일관된 프로필 이미지 유지
  const [profileImageIndex, setProfileImageIndex] = useState(() =>
    getRandomProfileIndex('Lucus'),
  );

  const currentProfile = PROFILE_IMAGE_OPTIONS[profileImageIndex];

  const handleRandomizeProfile = () => {
    // 현재 인덱스와 다른 랜덤 인덱스 선택
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * PROFILE_IMAGE_OPTIONS.length);
    } while (
      newIndex === profileImageIndex &&
      PROFILE_IMAGE_OPTIONS.length > 1
    );
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
        <section className="grid grid-cols-3 gap-8 items-start border-b border-gray-50 pb-10">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">사용자 프로필</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              프로필 이미지를 클릭하면 <br />
              랜덤으로 변경됩니다.
            </p>
          </div>
          <div className="col-span-2 flex items-center gap-6">
            <button
              onClick={handleRandomizeProfile}
              className="w-24 h-24 rounded-[36px] overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <div
                className={`w-full h-full bg-linear-to-br ${currentProfile.bgGradient} flex items-center justify-center transition-all`}
              >
                <UserIcon
                  className={`w-10 h-10 ${currentProfile.iconColor} transition-colors`}
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-black text-gray-700">
                    변경
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-8 items-start border-b border-gray-50 pb-10">
          <h3 className="font-bold text-gray-900">닉네임</h3>
          <div className="col-span-2">
            <input
              type="text"
              defaultValue="Lucus"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-bold focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-8 items-start">
          <h3 className="font-bold text-gray-900">이메일 주소</h3>
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-gray-500 font-medium">
              <span>lucus@example.com</span>
              <CheckIcon className="w-[18px] h-[18px] text-[#73C92E]" />
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={onSave}
          className="px-10 py-5 bg-[#FE8916] text-white rounded-[24px] font-black shadow-[0_12px_28px_rgba(254,137,22,0.3)] hover:bg-[#E67800] transition-all active:scale-95"
        >
          저장하기
        </button>
      </div>
    </motion.div>
  );
}

/**
 * 랜덤 프로필 이미지 인덱스 생성
 */
function getRandomProfileIndex(seed?: string): number {
  if (seed) {
    // 시드 기반 랜덤 (동일한 시드면 동일한 결과)
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return Math.abs(hash) % PROFILE_IMAGE_OPTIONS.length;
  }
  return Math.floor(Math.random() * PROFILE_IMAGE_OPTIONS.length);
}
