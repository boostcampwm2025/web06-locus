import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        Sentry.withScope((scope) => {
          /* Tags: 필터링 및 그룹화에 사용  */
          scope.setTag('error_boundary', 'true');

          /* Extra: 에러와 관련된 추가 정보 (React의 componentStack 포함) */
          scope.setExtras(errorInfo as unknown as Record<string, unknown>);

          Sentry.captureException(error);
        });
      }}
      // 만약 react-router 등을 사용 중이라면
      // 아래와 같이 location 변경 시 에러 상태를 초기화하도록 할 수 있습니다.
      // resetKeys={[window.location.pathname]}
    >
      {children}
    </ErrorBoundary>
  );
}
