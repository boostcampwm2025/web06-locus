/**
 * Settings Feature Types
 */

/**
 * 설정 탭 타입
 */
export type SettingsTab = 'profile' | 'notifications' | 'tags';

/**
 * 설정 페이지 Props
 */
export interface SettingsPageProps {
  onClose?: () => void;
  onLogout?: () => void;
}

/**
 * 설정 사이드바 Props
 */
export interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * 프로필 탭 Props
 */
export interface ProfileTabProps {
  onSave?: () => void;
}

/**
 * 알림 설정 탭 Props
 */
export interface NotificationsTabProps {
  isNotificationEnabled: boolean;
  onNotificationToggle: (enabled: boolean) => void;
  isPushEnabled: boolean;
  onPushToggle: (enabled: boolean) => void;
  notificationTime: string;
  onNotificationTimeChange: (time: string) => void;
}

/**
 * 태그 관리 탭 Props
 */
export interface TagsTabProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

/**
 * 삭제 확인 모달 Props
 */
export interface DeleteTagConfirmModalProps {
  isOpen: boolean;
  tagName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 로그아웃 확인 모달 Props
 */
export interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
