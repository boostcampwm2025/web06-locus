import { create } from 'zustand';
import * as Sentry from '@sentry/react';
import type { AuthState } from '../types/auth';
import {
  saveTokens,
  getTokens,
  clearTokens,
} from '@/infra/storage/tokenStorage';
import { logout as logoutApi } from '@/infra/api/services/authService';
import { logger } from '@/shared/utils/logger';

interface AuthStore extends AuthState {
  isInitialized: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  isInitialized: false,

  setTokens: (accessToken: string, refreshToken: string) => {
    saveTokens({ accessToken, refreshToken });
    set({
      isAuthenticated: true,
      accessToken,
      refreshToken,
    });

    // 사용자 컨텍스트 설정 (토큰에서 사용자 ID 추출 가능한 경우)
    // TODO: 실제 사용자 정보를 가져올 수 있으면 id, username 등 추가
    Sentry.setUser({
      // id: userId, // 사용자 ID가 있다면 추가
      // username: username, // 사용자명이 있다면 추가
    });
  },

  clearAuth: () => {
    clearTokens();
    set({ ...initialState, isInitialized: true });

    // 사용자 컨텍스트 제거
    Sentry.setUser(null);
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
      clearTokens();
      set({ ...initialState, isInitialized: true });

      // 사용자 컨텍스트 제거
      Sentry.setUser(null);
    }
  },

  initialize: () => {
    try {
      const tokens = getTokens();
      if (tokens) {
        set({
          isAuthenticated: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isInitialized: true,
        });
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
