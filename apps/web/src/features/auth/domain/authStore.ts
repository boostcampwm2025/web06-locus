import { create } from 'zustand';
import type { AuthState } from '../types/auth';
import {
  saveTokens,
  getTokens,
  clearTokens,
} from '@/infra/storage/tokenStorage';

interface AuthStore extends AuthState {
  isInitialized: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
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
  },

  clearAuth: () => {
    clearTokens();
    set({ ...initialState, isInitialized: true });
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
      // localStorage 접근 실패 등 예외 상황
      // 초기화는 완료된 것으로 간주하고 기본 상태로 진행
      console.error('Failed to initialize auth state:', error);
      set({ isInitialized: true });
    }
  },
}));
