import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/domain/authStore';
import { ROUTES } from '@/router/routes';
import { useGetTags } from '@/features/record/hooks/useGetTags';
import { useCreateTag } from '@/features/record/hooks/useCreateTag';
import { useDeleteTag } from '@/features/record/hooks/useDeleteTag';
import type { TagResponse } from '@/infra/api/services/tagService';
import type { SettingsTab, SettingsPageProps } from '../types';

export function useSettings({ onClose, onLogout }: SettingsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('19:03');
  const [tagToDelete, setTagToDelete] = useState<TagResponse | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: tags = [] } = useGetTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();

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

  const handleAddTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.name === trimmed)) return;
    createTagMutation.mutate({ name: trimmed });
  };

  const handleRemoveTag = (tag: TagResponse) => {
    deleteTagMutation.mutate(tag.publicId, {
      onSettled: () => setTagToDelete(null),
    });
  };

  return {
    activeTab,
    setActiveTab,
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
