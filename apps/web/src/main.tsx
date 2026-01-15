import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AppErrorBoundary from './shared/ui/error/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { API_BASE_URL } from './infra/api/apiClient';

// tracePropagationTargets를 동적으로 생성
const tracePropagationTargets: (string | RegExp)[] = ['localhost'];

// API 베이스 URL이 있으면 정규식으로 추가
if (API_BASE_URL) {
  // URL을 정규식으로 변환 (특수 문자 이스케이프)
  const escapedUrl = API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  tracePropagationTargets.push(new RegExp(`^${escapedUrl}`));
}

Sentry.init({
  dsn: (import.meta.env.VITE_SENTRY_DSN as string | undefined) ?? '',
  integrations: [Sentry.browserTracingIntegration()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
