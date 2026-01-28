import { AnimatePresence, motion } from 'motion/react';
import { useSettings } from '@features/settings/hooks/useSettings';
import { ProfileTabMobile } from './tabs/ProfileTab.mobile';
import { NotificationsTabMobile } from './tabs/NotificationsTab.mobile';
import { TagsTabMobile } from './tabs/TagsTab.mobile';
import { LogoutModal } from './modals/LogoutModal';
import type { SettingsPageMobileProps } from '@features/settings/types';

/**
 * 모바일 설정 페이지 메인 컴포넌트
 */
export default function SettingsPageMobile(props: SettingsPageMobileProps) {
  const {
    activeTab,
    setActiveTab,
    isNotificationEnabled,
    setIsNotificationEnabled,
    isPushEnabled,
    setIsPushEnabled,
    notificationTime,
    setNotificationTime,
    tags,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleClose,
    handleLogout,
    handleAddTag,
    handleRemoveTag,
  } = useSettings(props);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 bg-white flex flex-col overflow-hidden"
    >
      <LogoutModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <ProfileTabMobile
              key="profile"
              onBack={handleClose}
              onNavigateToNotifications={() => setActiveTab('notifications')}
              onNavigateToTags={() => setActiveTab('tags')}
              onLogout={() => setShowLogoutConfirm(true)}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTabMobile
              key="notifications"
              onBack={() => setActiveTab('profile')}
              isNotificationEnabled={isNotificationEnabled}
              onNotificationToggle={setIsNotificationEnabled}
              isPushEnabled={isPushEnabled}
              onPushToggle={setIsPushEnabled}
              notificationTime={notificationTime}
              onNotificationTimeChange={setNotificationTime}
            />
          )}
          {activeTab === 'tags' && (
            <TagsTabMobile
              key="tags"
              onBack={() => setActiveTab('profile')}
              tags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
