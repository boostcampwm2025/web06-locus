import { useAuthStore } from '@/features/auth/domain/authStore';

/**
 * 인증 도메인(authStore)에 대한 Facade 역할을 하는 커스텀 훅
 *
 * - authStore의 내부 구현을 숨기고
 * - UI / Routing 레이어에서는 이 훅만 사용하도록 한다
 * - 인증 관련 인터페이스를 단일 진입점으로 제공
 */

export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    setTokens,
    clearAuth,
  };
};
