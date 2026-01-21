/**
 * Sentry 동적 로딩 래퍼
 *
 * 이 래퍼를 사용하면 Sentry가 초기 번들에 포함되지 않습니다.
 *
 * 동작 원리
 * 1. 이 파일은 정적 임포트로 사용 가능 (작은 래퍼 코드만 초기 번들에 포함)
 * 2. 실제 Sentry는 동적 임포트(import())로 필요할 때만 로드
 * 3. Sentry가 로드되기 전 호출은 큐에 저장했다가 나중에 처리
 *
 * 사용 예시
 * ```typescript
 * import { sentry } from '@/shared/utils/sentryWrapper';
 *
 * // Sentry가 로드되지 않았어도 안전하게 호출 가능
 * sentry.captureException(error);
 * ```
 */

type SentryModule = typeof import('@sentry/react');

let sentryModule: SentryModule | null = null;
let sentryLoadPromise: Promise<SentryModule> | null = null;

/**
 * Sentry 모듈을 동적으로 로드
 * 이미 로드 중이면 기존 Promise 반환 (중복 로드 방지)
 */
async function loadSentry(): Promise<SentryModule> {
  // 이미 로드되어 있으면 즉시 반환
  if (sentryModule) {
    return sentryModule;
  }

  // 이미 로드 중이면 기존 Promise 반환
  if (sentryLoadPromise) {
    return sentryLoadPromise;
  }

  // 동적 임포트로 Sentry 로드
  sentryLoadPromise = import('@sentry/react').then((module) => {
    sentryModule = module;
    return module;
  });

  return sentryLoadPromise;
}

/**
 * Sentry가 로드되었는지 확인
 */
function isSentryLoaded(): boolean {
  return sentryModule !== null;
}

/**
 * Sentry 초기화 함수
 * main.tsx에서 호출하여 Sentry를 설정합니다.
 */
export async function initSentry(config: {
  dsn: string;
  integrations?: Parameters<
    (typeof import('@sentry/react'))['init']
  >[0]['integrations'];
  tracesSampleRate?: number;
  tracePropagationTargets?: (string | RegExp)[];
  sendDefaultPii?: boolean;
  release?: string;
  environment?: string;
}): Promise<void> {
  const Sentry = await loadSentry();

  Sentry.init({
    dsn: config.dsn,
    integrations: config.integrations,
    tracesSampleRate: config.tracesSampleRate,
    tracePropagationTargets: config.tracePropagationTargets,
    sendDefaultPii: config.sendDefaultPii,
    release: config.release,
    environment: config.environment,
  });
}

/**
 * Sentry API 래퍼
 * Sentry가 로드되지 않았을 때는 no-op으로 동작하거나
 * 로드 후에 처리하도록 큐에 저장
 */
export const sentry = {
  /**
   * 에러 캡처
   * Sentry가 로드되지 않았으면 로드 후 처리
   */
  captureException: async (
    error: Error,
    options?: Parameters<SentryModule['captureException']>[1],
  ) => {
    const Sentry = await loadSentry();
    return Sentry.captureException(error, options);
  },

  /**
   * 메시지 캡처
   */
  captureMessage: async (
    message: string,
    options?: Parameters<SentryModule['captureMessage']>[1],
  ) => {
    const Sentry = await loadSentry();
    return Sentry.captureMessage(message, options);
  },

  /**
   * Breadcrumb 추가
   */
  addBreadcrumb: async (
    breadcrumb: Parameters<SentryModule['addBreadcrumb']>[0],
  ) => {
    const Sentry = await loadSentry();
    return Sentry.addBreadcrumb(breadcrumb);
  },

  /**
   * 사용자 설정
   */
  setUser: async (user: Parameters<SentryModule['setUser']>[0] | null) => {
    const Sentry = await loadSentry();
    return Sentry.setUser(user);
  },

  /**
   * Scope와 함께 실행
   */
  withScope: async <T>(
    callback: Parameters<SentryModule['withScope']>[0],
  ): Promise<T> => {
    const Sentry = await loadSentry();
    // @ts-expect-error - Sentry.withScope의 타입 추론 문제로 인한 타입 에러
    return Sentry.withScope(callback);
  },

  /**
   * Sentry가 로드되었는지 확인
   */
  isLoaded: isSentryLoaded,
};

/**
 * 동기 버전 (Sentry가 이미 로드된 경우에만 사용)
 * 성능이 중요한 경우 사용하되, Sentry가 로드되지 않았으면 무시됨
 */
export const sentrySync = {
  captureException: (
    error: Error,
    options?: Parameters<SentryModule['captureException']>[1],
  ) => {
    if (sentryModule) {
      return sentryModule.captureException(error, options);
    }
    // Sentry가 로드되지 않았으면 무시 (또는 비동기로 처리)
    void sentry.captureException(error, options);
  },

  captureMessage: (
    message: string,
    options?: Parameters<SentryModule['captureMessage']>[1],
  ) => {
    if (sentryModule) {
      return sentryModule.captureMessage(message, options);
    }
    void sentry.captureMessage(message, options);
  },

  addBreadcrumb: (breadcrumb: Parameters<SentryModule['addBreadcrumb']>[0]) => {
    if (sentryModule) {
      return sentryModule.addBreadcrumb(breadcrumb);
    }
    void sentry.addBreadcrumb(breadcrumb);
  },

  setUser: (user: Parameters<SentryModule['setUser']>[0] | null) => {
    if (sentryModule) {
      return sentryModule.setUser(user);
    }
    void sentry.setUser(user);
  },
};
