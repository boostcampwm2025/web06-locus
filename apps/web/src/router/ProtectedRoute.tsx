import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/domain/authStore';
import { ROUTES } from './routes';
import { isOnboardingCompleted } from '@/infra/storage/onboardingStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * 인증된 사용자만 접근 가능한 페이지에 사용됩니다.
 * 온보딩이 완료되지 않은 경우 자동으로 온보딩 페이지로 리다이렉트합니다.
 * @param children - 자식 컴포넌트
 * @returns 자식 컴포넌트
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  // 인증되었지만 온보딩이 완료되지 않은 경우 온보딩으로 리다이렉트
  useEffect(() => {
    if (
      isAuthenticated &&
      !isOnboardingCompleted() &&
      location.pathname !== ROUTES.ONBOARDING
    ) {
      void navigate(ROUTES.ONBOARDING, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 온보딩 페이지이거나 온보딩이 완료된 경우에만 children 렌더링
  if (location.pathname === ROUTES.ONBOARDING || isOnboardingCompleted()) {
    return <>{children}</>;
  }

  // 리다이렉트 중에는 아무것도 렌더링하지 않음
  return null;
}
