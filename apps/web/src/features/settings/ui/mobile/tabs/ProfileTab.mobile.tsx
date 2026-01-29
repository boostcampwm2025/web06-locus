import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/shared/ui/image';
import { BackArrowIcon } from '@/shared/ui/icons/BackArrowIcon';
import { ChevronRightIconMobile } from '@/shared/ui/icons/ChevronRightIconMobile';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { LogoutIcon } from '@/shared/ui/icons/LogoutIcon';
import { BellIconMobile } from '@/shared/ui/icons/BellIconMobile';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import type { ProfileTabProps } from '@features/settings/types';

interface ProfileTabMobileProps extends ProfileTabProps {
  onBack: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToTags: () => void;
  onLogout: () => void;
}

/**
 * 메뉴 버튼 컴포넌트
 */
interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  iconBgColor: string;
  iconTextColor: string;
  labelColor?: string;
}

/**
 * 모바일 프로필 탭
 */
export function ProfileTabMobile({
  onBack,
  onNavigateToNotifications,
  onNavigateToTags,
  onLogout,
  user,
  userLoading,
  userError,
}: ProfileTabMobileProps) {
  const displayName =
    user?.nickname ?? user?.email ?? (userLoading ? '불러오는 중…' : '—');
  const displayEmail = userLoading
    ? '불러오는 중…'
    : userError
      ? '—'
      : (user?.email ?? '—');
  const profileImageUrl = user?.profileImageUrl ?? undefined;

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white flex flex-col"
    >
      <header className="flex h-[80px] items-center px-6 border-b border-[#f3f4f6] shrink-0">
        <button
          onClick={onBack}
          className="flex size-11 items-center justify-center rounded-2xl bg-[#f8fafc] transition-colors hover:bg-[#f1f3f5] active:scale-95"
        >
          <BackArrowIcon className="size-6 text-[#364153]" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-bold text-[#1a1c1e]">
          프로필
        </h1>
      </header>
      <main className="flex flex-col flex-1 overflow-y-auto">
        <section className="flex flex-col items-center py-10">
          <div className="relative mb-4 size-24 overflow-hidden rounded-full bg-[#f3f4f6] ring-4 ring-blue-50">
            <ImageWithFallback
              src={profileImageUrl ?? 'https://placehold.co/96x96'}
              alt="프로필 이미지"
              className="size-full object-cover"
            />
          </div>
          <h2 className="font-['Inter:SemiBold','Noto_Sans_KR:SemiBold',sans-serif] text-[22px] font-semibold text-[#1e2939]">
            {displayName}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#99a1af]">
            {displayEmail}
          </p>
        </section>
        <div className="h-2 bg-[#f3f4f6]/40" />
        <section className="p-7 pb-0">
          <h3 className="mb-4 font-['Inter:Bold',sans-serif] text-[12px] font-bold tracking-[1.5px] text-[#99a1af] uppercase">
            Account
          </h3>
          <div className="space-y-1">
            <MenuButton
              icon={<UserIcon className="size-5" />}
              label="계정 정보"
              onClick={() => {
                // TODO: 계정 정보 페이지로 이동
              }}
              iconBgColor="bg-gray-50"
              iconTextColor="text-[#4A5565]"
            />
            <MenuButton
              icon={<LogoutIcon className="size-5" />}
              label="로그아웃"
              onClick={onLogout}
              iconBgColor="bg-red-50"
              iconTextColor="text-[#FB2C36]"
              labelColor="text-[#fb2c36]"
            />
          </div>
        </section>
        <section className="p-7 pb-0">
          <h3 className="mb-4 font-['Inter:Bold',sans-serif] text-[12px] font-bold tracking-[1.5px] text-[#99a1af] uppercase">
            Notifications
          </h3>
          <MenuButton
            icon={<BellIconMobile className="size-5" />}
            label="알림 설정"
            onClick={onNavigateToNotifications}
            iconBgColor="bg-blue-50"
            iconTextColor="text-[#60a5fa]"
          />
        </section>
        <section className="p-7">
          <h3 className="mb-4 font-['Inter:Bold',sans-serif] text-[12px] font-bold tracking-[1.5px] text-[#99a1af] uppercase">
            Management
          </h3>
          <MenuButton
            icon={<TagIcon className="size-5" />}
            label="태그 관리"
            onClick={onNavigateToTags}
            iconBgColor="bg-emerald-50"
            iconTextColor="text-emerald-500"
          />
        </section>
      </main>
    </motion.div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  iconBgColor,
  iconTextColor,
  labelColor = 'text-[#364153]',
}: MenuButtonProps) {
  const hoverBgColor = iconBgColor
    .replace('bg-gray-50', 'group-hover:bg-gray-100')
    .replace('bg-red-50', 'group-hover:bg-red-100')
    .replace('bg-blue-50', 'group-hover:bg-blue-100')
    .replace('bg-emerald-50', 'group-hover:bg-emerald-100');

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between py-4 group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor} transition-colors ${hoverBgColor}`}
        >
          {icon}
        </div>
        <span
          className={`font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium ${labelColor}`}
        >
          {label}
        </span>
      </div>
      <ChevronRightIconMobile className="size-5 text-[#99A1AF] transition-transform group-hover:translate-x-1" />
    </button>
  );
}
