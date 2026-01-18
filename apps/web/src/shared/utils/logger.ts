import * as Sentry from '@sentry/react';

const isDevelopment = import.meta.env.MODE === 'development';

type LoggerExtra = Record<string, unknown>;

/**
 * 개발 환경과 프로덕션 환경을 구분하여 로깅하는 유틸리티
 * - 개발 환경: 콘솔 출력 + Sentry 전송
 * - 프로덕션 환경: Sentry 전송만
 */
export const logger = {
  /**
   * 에러 로깅
   * - 개발 환경: 콘솔 출력 + Sentry 전송
   * - 프로덕션 환경: Sentry 전송만
   */
  error: (error: Error, extra?: LoggerExtra) => {
    if (isDevelopment) {
      console.error('[Logger] Error:', error, extra ?? '');
    }

    Sentry.captureException(error, {
      extra,
      tags: {
        logger: 'error',
      },
    });
  },

  /**
   * 경고 로깅
   * - 개발 환경: 콘솔 출력 + Sentry 전송
   * - 프로덕션 환경: Sentry 전송만
   */
  warn: (message: string, extra?: LoggerExtra) => {
    if (isDevelopment) {
      console.warn('[Logger] Warning:', message, extra ?? '');
    }

    if (extra?.sendToSentry !== false) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra,
        tags: {
          logger: 'warn',
        },
      });
    }
  },

  /**
   * 정보 로깅
   * - 개발 환경: 콘솔 출력 + Sentry Breadcrumb 추가
   * - 프로덕션 환경: Sentry Breadcrumb만 추가 (에러 추적 시 컨텍스트 제공)
   */
  info: (message: string, extra?: LoggerExtra) => {
    if (isDevelopment) {
      console.info('[Logger] Info:', message, extra ?? '');
    }

    // 개발/프로덕션 모두 Breadcrumb 추가
    Sentry.addBreadcrumb({
      category: 'logger',
      message,
      level: 'info',
      data: extra,
    });
  },

  /**
   * 디버그 로깅
   * 개발 환경에서만 콘솔에 출력
   * 프로덕션 환경에서는 무시
   */
  debug: (message: string, extra?: LoggerExtra) => {
    if (isDevelopment) {
      console.debug('[Logger] Debug:', message, extra ?? '');
    }
  },
};
