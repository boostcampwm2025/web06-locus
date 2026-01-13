import { BrowserRouter } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './features/auth/domain/authStore';
import LoadingPage from './shared/ui/loading/LoadingPage';
import { getRandomLoadingVersion } from './shared/utils/loadingUtils';
import { AppRoutes } from './router';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const loadingVersionRef = useRef(getRandomLoadingVersion());

  // 앱 시작 시 저장된 토큰으로 인증 상태 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화가 완료될 때까지 로딩 화면 표시
  if (!isInitialized) {
    return <LoadingPage version={loadingVersionRef.current} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
