import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingPage from '@/shared/ui/loading/LoadingPage';
import ErrorFallback from '@/shared/ui/error/ErrorFallback';
import { useAuth } from '@/shared/hooks/useAuth';
import { getRandomLoadingVersion } from '@/shared/utils/loadingUtils';
import { ROUTES } from '@/router/routes';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, clearAuth } = useAuth();

  // 동일 페이지 여러 번 진입 방지
  const handledRef = useRef(false);

  // 컴포넌트 마운트 시 한 번만 랜덤 로딩 버전 선택
  const randomLoadingVersionRef = useRef(getRandomLoadingVersion());

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 이미 처리된 경우 중복 실행 방지
    if (handledRef.current) return;
    handledRef.current = true;

    try {
      const accessToken = searchParams.get('accessToken');
      // // const errorParam = searchParams.get('error');

      // if (errorParam) {
      //   setError(new Error(errorParam));
      //   setStatus('error');
      //   return;
      // }

      if (!accessToken) {
        setError(new Error('인증 정보가 전달되지 않았습니다.'));
        setStatus('error');
        return;
      }

      // refreshToken은 /auth/reissue 엔드포인트에서 쿠키로 자동 전송됨
      void setTokens(accessToken);

      // URL에서 토큰 파라미터 제거
      window.history.replaceState({}, document.title, ROUTES.AUTH_CALLBACK);

      // ProtectedRoute에서 온보딩 체크를 처리하므로 HOME으로 이동
      void navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      // 예외 발생 시 기존 토큰 정리
      clearAuth();

      setError(
        err instanceof Error
          ? err
          : new Error('인증 처리 중 오류가 발생했습니다.'),
      );
      setStatus('error');
    }
  }, [searchParams, setTokens, clearAuth, navigate]);

  if (status === 'loading')
    return <LoadingPage version={randomLoadingVersionRef.current} />;

  return (
    <ErrorFallback
      error={error ?? new Error('알 수 없는 오류가 발생했습니다.')}
      resetErrorBoundary={() => {
        void navigate(ROUTES.LOGIN, { replace: true });
      }}
    />
  );
}
