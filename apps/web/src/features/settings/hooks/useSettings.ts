import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/domain/authStore';
import { ROUTES } from '@/router/routes';
import { useCurrentUser } from './useCurrentUser';

// 알림 관련 서비스 및 유틸
import {
  getNotificationSettings,
  postNotificationSettings,
  patchNotificationTime,
} from '@/infra/api/services/notificationService';
import { getFcmToken } from '@/infra/firebase/fcm';
import { isClientError } from '@/shared/errors';

// 태그 관리 관련 커스텀 훅
import { useGetTags } from '@/features/record/hooks/useGetTags';
import { useCreateTag } from '@/features/record/hooks/useCreateTag';
import { useDeleteTag } from '@/features/record/hooks/useDeleteTag';
import type { TagResponse } from '@/infra/api/services/tagService';

import type { SettingsTab, SettingsPageProps } from '../types';

const NOTIFICATION_SETTINGS_QUERY_KEY = ['notificationSettings'] as const;
const DEFAULT_NOTIFY_TIME = '19:00';

export function useSettings({
  onClose,
  onLogout,
  notificationEditable = false, // 모바일 PWA 환경에서만 true로 전달됨
}: SettingsPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 사용자 정보 관리
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 알림 설정 조회 (GET)
  const { data: notificationSettings, isLoading: notificationLoading } =
    useQuery({
      queryKey: NOTIFICATION_SETTINGS_QUERY_KEY,
      queryFn: async () => {
        try {
          return await getNotificationSettings();
        } catch (error) {
          // 서버에 설정이 없는(404) 경우, 에러를 내지 않고 기본 꺼짐 상태로 반환
          if (isClientError(error) && error.code === 'NOT_FOUND_NOTIFICATION') {
            return {
              isActive: false,
              notifyTime: DEFAULT_NOTIFY_TIME,
            };
          }
          throw error;
        }
      },
    });

  // 알림 상태 변경 (POST - 켜기/끄기)
  const postMutation = useMutation({
    mutationFn: postNotificationSettings,
    onSuccess: (data) => {
      // 서버 데이터 업데이트 성공 시 캐시 최신화
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, data);
    },
  });

  // 알림 시간 변경 (PATCH)
  const patchTimeMutation = useMutation({
    mutationFn: patchNotificationTime,
    onSuccess: (data) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, data);
    },
  });

  // UI에 표시할 데이터 가공 (파생 상태)
  const isNotificationEnabled = notificationSettings?.isActive ?? false;
  const notificationTime = notificationSettings?.notifyTime ?? DEFAULT_NOTIFY_TIME;
  const isPushEnabled = notificationSettings?.isActive ?? false;

  const setIsNotificationEnabled = (enabled: boolean) => {
    if (!notificationEditable) return;

    if (enabled) {
      /**
       * 브라우저/FCM으로부터 고유 토큰을 먼저 받아옴
       * 받아온 토큰과 함께 서버에 알림 활성화 요청
       */
      void getFcmToken().then((fcmToken) => {
        postMutation.mutate({
          isActive: true,
          fcmToken: fcmToken ?? undefined,
        });
      });
    } else {
      /**
       * 토큰 필요 없이 비활성화 정보만 서버에 전송
       */
      postMutation.mutate({ isActive: false });
    }
  };

  /**
   * 푸시 알림 전용 핸들러 (위 로직과 동일하게 동작)
   */
  const setIsPushEnabled = (enabled: boolean) => {
    if (!notificationEditable) return;
    setIsNotificationEnabled(enabled);
  };

  /**
   * 알림 시간 업데이트 핸들러
   */
  const setNotificationTime = (timeString: string) => {
    if (!notificationEditable) return;
    patchTimeMutation.mutate(timeString);
  };

  // 태그 관리 관련 로직 (develop 서버 연동 기반)
  const { data: tags = [] } = useGetTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();
  const [tagToDelete, setTagToDelete] = useState<TagResponse | null>(null);

  // 기타 핸들러 (닫기, 로그아웃, 태그 추가/삭제)
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

  // 컴포넌트에서 사용할 데이터/함수 반환
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
  };
}