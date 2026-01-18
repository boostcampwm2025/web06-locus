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
  // TODO: authStore에 user 정보가 추가되면 주석 해제
  // const user = useAuthStore((state) => state.user); // 유저 정보 가져오기
  const loadingVersionRef = useRef(getRandomLoadingVersion());

  // 앱 시작 시 저장된 토큰으로 인증 상태 초기화
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    // TODO: authStore에 user 정보가 추가되면 주석 해제
    // if (isInitialized && user) {
    //   // 로그인된 사용자가 있다면 Sentry에 신원 등록
    //   Sentry.setUser({
    //     id: user.id,
    //     username: user.nickname, // 또는 email
    //   });
    // } else if (isInitialized && !user) {
    //   // 사용자가 없으면 Sentry 사용자 정보 제거
    //   Sentry.setUser(null);
    // }
  }, [isInitialized]);

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
