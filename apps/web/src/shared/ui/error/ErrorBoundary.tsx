import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { sentry } from '@/shared/utils/sentryWrapper';
import ErrorFallback from './ErrorFallback';
import { isServerError } from '@/shared/errors';

interface Props {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: Props) {
  // React Query의 에러 상태를 초기화하는 함수
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      // '다시 시도' 버튼 등을 눌렀을 때 React Query 캐시를 비워 재요청이 가능하게 함.
      onReset={reset}
      onError={(error, errorInfo) => {
        // ServerError(5xx)가 아닌 일반적인 클라이언트 에러는 로깅하지 않고 무시
        if (!isServerError(error)) {
          return;
        }

        void sentry.captureException(error, {
          tags: {
            error_boundary: 'true',
            error_type: 'server_error',
          },
          extra: {
            // 에러가 발생한 컴포넌트 트리 정보 등을 추가
            componentStack: errorInfo.componentStack,
          },
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
