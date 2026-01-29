import { AnimatePresence, motion } from 'motion/react';
import { useSettings } from '../../hooks/useSettings';
import { SettingsSidebar } from './SettingsSidebar';
import { DeleteTagConfirmModal } from './modals/DeleteTagConfirmModal';
import { LogoutConfirmModal } from './modals/LogoutConfirmModal';
import { ProfileTab } from './tabs/ProfileTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { TagsTab } from './tabs/TagsTab';
import type { SettingsPageProps } from '../../types';

/**
 * 설정 페이지 메인 컴포넌트
 */
export default function SettingsPageDesktop(props: SettingsPageProps) {
  const {
    activeTab,
    setActiveTab,
    user,
    userLoading,
    userError,
    isNotificationEnabled,
    setIsNotificationEnabled,
    isPushEnabled,
    setIsPushEnabled,
    notificationTime,
    setNotificationTime,
    notificationLoading,
    tags,
    tagToDelete,
    setTagToDelete,
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
      className="fixed inset-0 z-200 bg-white flex overflow-hidden"
    >
      <DeleteTagConfirmModal
        isOpen={!!tagToDelete}
        tagName={tagToDelete ?? ''}
        onConfirm={() => tagToDelete && handleRemoveTag(tagToDelete)}
        onCancel={() => setTagToDelete(null)}
      />

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={handleClose}
        onLogout={() => setShowLogoutConfirm(true)}
        user={user}
        userLoading={userLoading}
      />

      <main className="flex-1 overflow-y-auto bg-white flex justify-center">
        <div className="w-full max-w-3xl p-20 pt-24">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <ProfileTab
                key="profile"
                user={user}
                userLoading={userLoading}
                userError={userError}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab
                key="notifications"
                isNotificationEnabled={isNotificationEnabled}
                onNotificationToggle={setIsNotificationEnabled}
                isPushEnabled={isPushEnabled}
                onPushToggle={setIsPushEnabled}
                notificationTime={notificationTime}
                onNotificationTimeChange={setNotificationTime}
                readOnly
                notificationLoading={notificationLoading}
              />
            )}
            {activeTab === 'tags' && (
              <TagsTab
                key="tags"
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={(tag) => setTagToDelete(tag)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}
