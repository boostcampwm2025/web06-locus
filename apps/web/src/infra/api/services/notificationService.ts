import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';

interface NotificationSettingsApiResponse {
  status: 'success';
  data: NotificationSettings;
}

/** PWA(standalone)일 때만 백엔드 검증용 헤더. 값은 대문자 PWA. */
function getPwaRequestHeaders(): Record<string, string> {
  if (
    typeof window === 'undefined' ||
    !window.matchMedia('(display-mode: standalone)').matches
  ) {
    return {};
  }
  return {
    'X-Requested-With': 'PWA',
    'x-display-mode': 'standalone',
  };
}

/**
 * 알림 설정 응답 (GET /notifications/settings data)
 */
export interface NotificationSettings {
  isActive: boolean;
  notifyTime: string; // "HH:mm"
}

/**
 * 알림 설정 조회
 * GET /notifications/settings
 * 데스크톱/모바일 공통
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const response = await apiClient<NotificationSettingsApiResponse>(
    API_ENDPOINTS.NOTIFICATIONS_SETTINGS,
    { method: 'GET' },
  );
  if (response?.status === 'success' && response.data != null) {
    return response.data;
  }
  throw new Error('알림 설정 응답 형식이 올바르지 않습니다.');
}

/**
 * 알림 설정(해제) 요청 바디
 * isActive true일 때 fcmToken 필수 (PWA 전용)
 */
export interface PostNotificationSettingsBody {
  isActive: boolean;
  fcmToken?: string;
}

/**
 * 알림 설정(해제)
 * POST /notifications/settings
 * PWA(모바일) 전용. isActive true면 fcmToken 필수.
 */
export async function postNotificationSettings(
  body: PostNotificationSettingsBody,
): Promise<NotificationSettings> {
  const response = await apiClient<NotificationSettingsApiResponse>(
    API_ENDPOINTS.NOTIFICATIONS_SETTINGS,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: getPwaRequestHeaders(),
    },
  );
  if (response?.status === 'success' && response.data != null) {
    return response.data;
  }
  throw new Error('알림 설정 응답 형식이 올바르지 않습니다.');
}

/**
 * 알림 시간 변경
 * PATCH /notifications/settings/time
 * PWA(모바일) 전용.
 */
export async function patchNotificationTime(
  notifyTime: string, // "HH:mm"
): Promise<NotificationSettings> {
  const response = await apiClient<NotificationSettingsApiResponse>(
    API_ENDPOINTS.NOTIFICATIONS_SETTINGS_TIME,
    {
      method: 'PATCH',
      body: JSON.stringify({ notifyTime }),
      headers: getPwaRequestHeaders(),
    },
  );
  if (response?.status === 'success' && response.data != null) {
    return response.data;
  }
  throw new Error('알림 시간 변경 응답 형식이 올바르지 않습니다.');
}
