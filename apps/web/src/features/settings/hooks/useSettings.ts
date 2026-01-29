import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/domain/authStore';
import { ROUTES } from '@/router/routes';
import { useCurrentUser } from './useCurrentUser';
import type { SettingsTab, SettingsPageProps } from '../types';

export function useSettings({ onClose, onLogout }: SettingsPageProps) {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('19:03');
  const [tags, setTags] = useState(['여행', '맛집', '데이트', '산책', '일상']);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      void navigate(ROUTES.HOME);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      void useAuthStore.getState().logout();
      void navigate(ROUTES.LOGIN);
    }
    setShowLogoutConfirm(false);
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setTagToDelete(null);
  };

  return {
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
    tags,
    tagToDelete,
    setTagToDelete,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleClose,
    handleLogout,
    handleAddTag,
    handleRemoveTag,
  };
}
