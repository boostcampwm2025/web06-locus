import { create } from 'zustand';
import { sentry } from '@/shared/utils/sentryWrapper';
import type { AuthState } from '../types/auth';
import { saveTokens, clearTokens } from '@/infra/storage/tokenStorage';
import { logout as logoutApi } from '@/infra/api/services/authService';
import { getCurrentUser } from '@/infra/api/services/userService';
import { executeRefresh } from '@/infra/api';
import { logger } from '@/shared/utils/logger';
import {
  setCurrentUserId,
  clearCurrentUserId,
  clearUserData,
} from '@/infra/storage/userScopedStorage';

interface AuthStore extends AuthState {
  isInitialized: boolean;
  userPublicId: string | null;
  setTokens: (accessToken: string) => Promise<void>;
  clearAuth: () => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  isInitialized: false,
  userPublicId: null,

  setTokens: async (accessToken: string) => {
    saveTokens(accessToken);
    set({
      isAuthenticated: true,
      accessToken,
      refreshToken: null, // refreshToken은 쿠키에만 저장되므로 메모리에는 null
    });

    // 사용자 정보를 가져와서 Sentry에 설정 및 사용자 ID 저장
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.publicId);
      set({ userPublicId: user.publicId });
      void sentry.setUser({
        id: user.publicId,
        username: user.nickname ?? undefined,
        email: user.email,
      });
    } catch (error) {
      // 사용자 정보 조회 실패 시 로그만 남기고 계속 진행
      if (error instanceof Error) {
        logger.warn('사용자 정보 조회 실패 (Sentry 사용자 설정 스킵)', {
          context: 'authStore.setTokens',
          error_type: 'user_fetch_error',
        });
      }
    }
  },

  clearAuth: () => {
    // 로그아웃 전에 현재 사용자 ID 저장 (데이터 정리를 위해)
    const currentUserId = useAuthStore.getState().userPublicId;

    clearTokens();
    clearCurrentUserId();

    // 현재 사용자의 모든 스토리지 데이터 정리
    if (currentUserId) {
      clearUserData(currentUserId);
    }

    set({ ...initialState, isInitialized: true, userPublicId: null });

    // 사용자 컨텍스트 제거
    void sentry.setUser(null);
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error, {
          context: '로그아웃 API 호출 실패',
          error_type: 'logout_error',
        });
      } else {
        logger.error(new Error('로그아웃 중 알 수 없는 오류가 발생했습니다'), {
          context: '로그아웃 API 호출 실패',
          error_type: 'logout_error',
          originalError: error,
        });
      }
    } finally {
      // 로그아웃 전에 현재 사용자 ID 저장 (데이터 정리를 위해)
      const currentUserId = useAuthStore.getState().userPublicId;

      clearTokens();
      clearCurrentUserId();

      // 현재 사용자의 모든 스토리지 데이터 정리
      if (currentUserId) {
        clearUserData(currentUserId);
      }

      set({ ...initialState, isInitialized: true, userPublicId: null });

      // 사용자 컨텍스트 제거
      void sentry.setUser(null);
    }
  },

  initialize: async () => {
    // 백그라운드에서 refreshToken(쿠키)으로 재발급 시도
    // 실패해도 앱은 정상 시작 (첫 API 요청 시 401이면 재발급 재시도)
    try {
      // refreshToken이 쿠키에 있는지 확인하기 위해 재발급 API 호출 시도
      const newAccessToken = await executeRefresh();

      if (newAccessToken) {
        set({
          isAuthenticated: true,
          accessToken: newAccessToken,
          refreshToken: null, // refreshToken은 쿠키에만 있음
          isInitialized: true,
        });

        // 사용자 정보를 가져와서 Sentry에 설정 및 사용자 ID 저장
        try {
          const user = await getCurrentUser();
          setCurrentUserId(user.publicId);
          set({ userPublicId: user.publicId });
          void sentry.setUser({
            id: user.publicId,
            username: user.nickname ?? undefined,
            email: user.email,
          });
        } catch (error) {
          // 사용자 정보 조회 실패 시 로그만 남기고 계속 진행
          if (error instanceof Error) {
            logger.warn('사용자 정보 조회 실패 (Sentry 사용자 설정 스킵)', {
              context: 'authStore.initialize',
              error_type: 'user_fetch_error',
            });
          }
        }
      } else {
        // 재발급 실패: 인증 상태 초기화
        set({ ...initialState, isInitialized: true });
      }
    } catch {
      // 재발급 실패는 정상적인 상황일 수 있음 (로그인하지 않은 사용자)
      // 에러 로그는 executeRefresh 내부에서 이미 기록되므로 여기서는 조용히 처리
      set({ ...initialState, isInitialized: true });
    }
  },
}));
