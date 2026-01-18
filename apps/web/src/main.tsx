import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AppErrorBoundary from './shared/ui/error/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

Sentry.init({
  dsn: SENTRY_DSN ?? '',
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 배포 시 샘플링 비율 조정
  tracePropagationTargets: ['localhost', /^\/api/],
  sendDefaultPii: true,
  release: (import.meta.env.VITE_APP_VERSION as string) || 'development',
  environment: import.meta.env.MODE,
});

const setupSentryContext = () => {
  const { userAgent } = navigator;

  // OS 그룹 판단
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = userAgent.includes('Android');
  const osGroup = isIOS ? 'ios' : isAndroid ? 'android' : 'other';

  // 브라우저 판단
  const getBrowser = () => {
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Firefox')) return 'firefox';
    return 'other';
  };

  // PWA 여부
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // 일괄 태그 설정
  Sentry.setTags({
    os_group: osGroup,
    pwa_mode: isStandalone ? 'standalone' : 'browser',
    browser: getBrowser(),
    screen_size: `${window.innerWidth}x${window.innerHeight}`,
  });
};

setupSentryContext();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}
