import { logger } from '@/shared/utils/logger';

/**
 * API 요청 로깅 (개발 환경에서만 콘솔 출력)
 */
export function trackApiBreadcrumb(
  method: string,
  endpoint: string,
  url: string,
): void {
  if (import.meta.env.MODE === 'development') {
    console.info(`[API] ${method} ${endpoint}`, { url, method });
  }
}

/**
 * API 응답 로깅
 * - 성공 응답: 개발 환경에서만 콘솔 출력
 * - 실패 응답: Sentry breadcrumb 추가 (에러 추적 시 컨텍스트 제공)
 */
export function trackResponseBreadcrumb(
  method: string,
  endpoint: string,
  status: number,
  duration: number,
): void {
  const isSuccess = status >= 200 && status < 300;

  if (isSuccess) {
    // TODO: 리팩토링 기간 이후 삭제
    // 성공 응답은 개발 환경에서만 콘솔 출력 (Sentry 등록 안 함)
    if (import.meta.env.MODE === 'development') {
      console.info(`[API] ${method} ${endpoint} - ${status}`, {
        status,
        duration,
      });
    }
  } else {
    // 실패 응답만 Sentry breadcrumb 추가
    logger.info(`API ${method} ${endpoint} - ${status}`, {
      status,
      duration,
    });
  }
}
