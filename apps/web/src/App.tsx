import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import OAuthLoginPage from './features/auth/ui/OAuthLoginPage';
import OAuthCallbackPage from './features/auth/ui/OAuthCallbackPage';
import { useAuthStore } from './features/auth/domain/authStore';
import { ProtectedRoute, PublicRoute } from './shared/ui/routing';
import LoadingPage from './shared/ui/loading/LoadingPage';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // 앱 시작 시 저장된 토큰으로 인증 상태 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화가 완료될 때까지 로딩 화면 표시
  if (!isInitialized) {
    return <LoadingPage version={1} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <OAuthLoginPage />
            </PublicRoute>
          }
        />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        {/* TODO: UI PR Merge 후 실제 메인 페이지 컴포넌트로 교체 필요 */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <div>메인 페이지 (인증 필요)</div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
