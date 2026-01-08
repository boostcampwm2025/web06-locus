import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/domain/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 공개 라우트 컴포넌트 (로그인 페이지 등)
 * 로그인 페이지 등 인증이 필요하지 않은 페이지에 사용됩니다.
 * @param children - 자식 컴포넌트
 * @param redirectTo - 리다이렉트할 페이지
 * @returns 자식 컴포넌트
 */
export default function PublicRoute({
  children,
  redirectTo = '/home',
}: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
