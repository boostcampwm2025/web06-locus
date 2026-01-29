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
  /** GET /users/me 로 조회한 사용자 (로딩/에러 시 undefined) */
  user?: import('@/infra/api/services/userService').UserProfile | null;
  userLoading?: boolean;
}

/**
 * 프로필 탭 Props
 */
export interface ProfileTabProps {
  onSave?: () => void;
  /** GET /users/me 로 조회한 사용자 (로딩/에러 시 undefined) */
  user?: import('@/infra/api/services/userService').UserProfile | null;
  userLoading?: boolean;
  userError?: boolean;
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

/**
 * 모바일 설정 페이지 Props
 */
export interface SettingsPageMobileProps {
  onClose?: () => void;
  onLogout?: () => void;
}

/**
 * 시간 선택 모달 Props
 */
export interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime: { hour: number; minute: number };
  onSave: (time: { hour: number; minute: number }) => void;
}

/**
 * 커스텀 셀렉트 Props
 */
export interface CustomSelectProps {
  value: number;
  options: number[];
  onChange: (val: number) => void;
  label: string;
}

/**
 * 토글 컴포넌트 Props
 */
export interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
}
