import { useAuthStore } from '@/features/auth/domain/authStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * 인증 도메인(authStore)에 대한 Facade 역할을 하는 커스텀 훅
 *
 * - authStore의 내부 구현을 숨기고
 * - UI / Routing 레이어에서는 이 훅만 사용하도록 한다
 * - 인증 관련 인터페이스를 단일 진입점으로 제공
 */
export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      setTokens: state.setTokens,
      clearAuth: state.clearAuth,
    })),
  );
};
