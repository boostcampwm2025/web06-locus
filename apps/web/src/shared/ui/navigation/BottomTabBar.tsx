import { MapIcon, BookmarkIcon } from '@/shared/icons/Icons';
import type { BottomTabBarProps, TabId } from '@/shared/types/navigation';

const tabs: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'home',
    label: '홈',
    icon: MapIcon,
  },
  {
    id: 'record',
    label: '기록',
    icon: BookmarkIcon,
  },
];

export default function BottomTabBar({
  activeTab = 'home',
  onTabChange,
  className = '',
}: BottomTabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="하단 네비게이션"
      className={`flex items-center justify-around bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-label={tab.label}
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange?.(tab.id)}
            className="flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <Icon
              className={`w-6 h-6 transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-xs font-medium transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
