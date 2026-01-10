import { Routes, Route, Navigate } from 'react-router-dom';
import OAuthLoginPage from '@/features/auth/ui/OAuthLoginPage';
import OAuthCallbackPage from '@/features/auth/ui/OAuthCallbackPage';
import MainMapPage from '@/features/home/ui/MainMapPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RecordWritePageRoute from './RecordWritePageRoute';
import { ROUTES } from './routes';

/**
 * 애플리케이션의 모든 라우트를 정의합니다.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <OAuthLoginPage />
          </PublicRoute>
        }
      />
      <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <MainMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RECORD}
        element={
          <ProtectedRoute>
            <RecordWritePageRoute />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
