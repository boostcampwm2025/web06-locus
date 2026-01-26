import { create } from 'zustand';
import { sentry } from '@/shared/utils/sentryWrapper';
import type { AuthState } from '../types/auth';
import {
  saveTokens,
  getTokens,
  clearTokens,
} from '@/infra/storage/tokenStorage';
import { logout as logoutApi } from '@/infra/api/services/authService';
import { getCurrentUser } from '@/infra/api/services/userService';
import { logger } from '@/shared/utils/logger';
import {
  setCurrentUserId,
  clearCurrentUserId,
  clearUserData,
} from '@/infra/storage/userScopedStorage';

interface AuthStore extends AuthState {
  isInitialized: boolean;
  userPublicId: string | null;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
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

  setTokens: async (accessToken: string, refreshToken: string) => {
    saveTokens({ accessToken, refreshToken });
    set({
      isAuthenticated: true,
      accessToken,
      refreshToken,
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
    try {
      const tokens = getTokens();
      if (tokens) {
        set({
          isAuthenticated: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isInitialized: true,
        });

        // 토큰이 있으면 사용자 정보를 가져와서 Sentry에 설정 및 사용자 ID 저장
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
        set({ isInitialized: true });
      }
    } catch (error) {
      // localStorage 접근 실패 등의 예외 상황에서도 초기화는 완료된 것으로 간주하고 기본 상태로 진행
      if (error instanceof Error) {
        logger.error(error, {
          context: 'localStorage에서 인증 상태 초기화 실패',
          error_type: 'auth_initialization_error',
        });
      } else {
        logger.error(
          new Error('인증 상태 초기화 중 알 수 없는 오류가 발생했습니다'),
          {
            context: 'localStorage에서 인증 상태 초기화 실패',
            error_type: 'auth_initialization_error',
            originalError: error,
          },
        );
      }
      set({ isInitialized: true });
    }
  },
}));
