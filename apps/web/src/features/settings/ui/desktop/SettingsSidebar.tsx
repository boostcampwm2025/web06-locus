import { motion } from 'motion/react';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { BellIcon } from '@/shared/ui/icons/BellIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { LogoutIcon } from '@/shared/ui/icons/LogoutIcon';
import { ChevronLeftIcon } from '@/shared/ui/icons/ChevronLeftIcon';
import type { SettingsSidebarProps, SettingsTab } from '../../types';
import type React from 'react';

const menuItems: {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'profile', label: '프로필 정보', icon: UserIcon },
  { id: 'notifications', label: '알림 설정', icon: BellIcon },
  { id: 'tags', label: '태그 관리', icon: TagIcon },
];

export function SettingsSidebar({
  activeTab,
  onTabChange,
  onClose,
  onLogout,
  user,
  userLoading,
}: SettingsSidebarProps) {
  const displayName =
    user?.nickname ?? user?.email ?? (userLoading ? '불러오는 중…' : '—');
  const displayEmail = userLoading ? '' : (user?.email ?? '');

  return (
    <aside className="w-[320px] bg-gray-50 border-r border-gray-100 flex flex-col h-full">
      <div className="p-8 pb-4">
        <button
          onClick={onClose}
          className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">지도로 돌아가기</span>
        </button>

        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="w-16 h-16 rounded-3xl bg-[#FE8916] flex items-center justify-center text-white shadow-lg shadow-orange-100 relative">
            <UserIcon className="w-8 h-8" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#73C92E] border-4 border-gray-50 rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight truncate">
              {displayName}
            </h2>
            {displayEmail && (
              <p className="text-xs text-gray-400 font-medium truncate">
                {displayEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          Account Settings
        </p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group ${
              activeTab === item.id
                ? 'bg-white text-[#FE8916] shadow-sm shadow-orange-50/50 ring-1 ring-gray-100 font-bold'
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${
                activeTab === item.id
                  ? 'text-[#FE8916]'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
            <span className="text-sm">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FE8916]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/30 transition-all font-black text-sm"
        >
          <LogoutIcon className="w-[18px] h-[18px]" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
