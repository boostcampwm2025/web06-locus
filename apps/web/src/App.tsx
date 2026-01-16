import { BrowserRouter } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './features/auth/domain/authStore';
import LoadingPage from './shared/ui/loading/LoadingPage';
import { getRandomLoadingVersion } from './shared/utils/loadingUtils';
import { AppRoutes } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const loadingVersionRef = useRef(getRandomLoadingVersion());

  // 앱 시작 시 저장된 토큰으로 인증 상태 초기화
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // 초기화가 완료될 때까지 로딩 화면 표시
  if (!isInitialized) {
    return <LoadingPage version={loadingVersionRef.current} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
