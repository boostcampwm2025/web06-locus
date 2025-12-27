import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface Props {
    children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: Props) {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            // TODO: 에러 로깅 도입 시 사용 (ex. Sentry)
            // onError={(error, errorInfo) => {
            //   Sentry.captureException(error, { extra: errorInfo });
            // }}

            // TODO: 재시도 UX 정책 확정 후 구현
            // onReset={() => {
            //   // 상태 초기화 or refetch
            // }}

            // TODO: 페이지 전환 등 자동 리셋이 필요해질 경우 사용
            // resetKeys={[location.pathname]}
        >
            {children}
        </ErrorBoundary>
    );
}
