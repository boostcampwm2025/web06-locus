import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AppErrorBoundary from './shared/ui/error/ErrorBoundary';

/**
 * Sentry 지연 로딩 로직
 * 초기 렌더링에 방해되지 않도록 동적 임포트(import())와
 * 브라우저의 휴식 시간(requestIdleCallback)을 활용.
 */
const initializeSentry = () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!SENTRY_DSN) return;

  const loadSentry = async () => {
    try {
      // 필요한 라이브러리들을 비동기로 한꺼번에 불러옴
      const [Sentry, routerHooks] = await Promise.all([
        import('@sentry/react'),
        import('react-router-dom'),
      ]);

      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect, // 리액트에서 이미 가져온 useEffect 사용
            useLocation: routerHooks.useLocation,
            useNavigationType: routerHooks.useNavigationType,
            createRoutesFromChildren: routerHooks.createRoutesFromChildren,
            matchRoutes: routerHooks.matchRoutes,
          }),
        ],
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        tracePropagationTargets: ['localhost', /^\/api/],
        sendDefaultPii: true,
        release: (import.meta.env.VITE_APP_VERSION as string) || 'development',
        environment: import.meta.env.MODE,
      });

      // Sentry 컨텍스트 설정 (태그 등)
      const { userAgent } = navigator;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroid = userAgent.includes('Android');
      const osGroup = isIOS ? 'ios' : isAndroid ? 'android' : 'other';

      const getBrowser = () => {
        if (userAgent.includes('Chrome')) return 'chrome';
        if (userAgent.includes('Safari')) return 'safari';
        if (userAgent.includes('Firefox')) return 'firefox';
        return 'other';
      };

      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;

      Sentry.setTags({
        os_group: osGroup,
        pwa_mode: isStandalone ? 'standalone' : 'browser',
        browser: getBrowser(),
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
      });

      // Sentry 초기화 완료 후 logger 사용 가능
      const { logger } = await import('./shared/utils/logger');
      logger.info('Sentry 초기화 완료');
    } catch (error) {
      // Sentry 초기화 실패 시 logger를 사용할 수 없으므로 console 사용
      console.error('Sentry 초기화 실패:', error);
    }
  };

  // 브라우저가 한가할 때(Idle) 로드하여 메인 스레드 차단을 방지.
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        void loadSentry();
      },
      { timeout: 2000 },
    );
  } else {
    setTimeout(() => {
      void loadSentry();
    }, 2000);
  }
};

// Sentry 실행 (비동기로 백그라운드에서 진행됨)
initializeSentry();

/**
 * 초기 HTML 로딩 화면 제거 로직
 */
const removeInitialLoading = () => {
  const initialLoading = document.getElementById('initial-loading');
  if (initialLoading) {
    initialLoading.classList.add('hidden');
    // 페이드 아웃 애니메이션 시간만큼 기다린 후 제거
    setTimeout(() => {
      initialLoading.remove();
    }, 150);
  }
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );

  /**
   * 마운트 시점 최적화
   * - 리액트가 렌더링을 시도한 직후, 브라우저가 다음 프레임을 그릴 때 로딩창을 제거.
   * - 이렇게 해야 '하얀 화면' 없이 부드럽게 전환됨.
   */
  requestAnimationFrame(() => {
    // 렌더링이 시작된 직후 약간의 여유를 두고 제거
    setTimeout(removeInitialLoading, 50);
  });
}
