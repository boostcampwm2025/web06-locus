export type TabId = 'home' | 'record';

export interface BottomTabBarProps {
  activeTab?: TabId;
  onTabChange?: (tabId: TabId) => void;
  className?: string;
}
