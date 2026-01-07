import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/domain/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * 인증된 사용자만 접근 가능한 페이지에 사용됩니다.
 * @param children - 자식 컴포넌트
 * @returns 자식 컴포넌트
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
