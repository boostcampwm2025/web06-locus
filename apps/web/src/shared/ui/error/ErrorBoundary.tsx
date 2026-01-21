import { ErrorBoundary } from 'react-error-boundary';
import { sentry } from '@/shared/utils/sentryWrapper';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // @ts-expect-error - sentry.withScope의 타입 추론 문제로 인한 타입 에러
        void sentry.withScope((scope) => {
          /* Tags: 필터링 및 그룹화에 사용  */
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          scope.setTag('error_boundary', 'true');

          /* Extra: 에러와 관련된 추가 정보 (React의 componentStack 포함) */
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          scope.setExtras(errorInfo as unknown as Record<string, unknown>);

          void sentry.captureException(error);
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
