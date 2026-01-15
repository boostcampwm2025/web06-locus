import type { WaitForNaverMapOptions } from '@/infra/types/map';

/**
 * Naver Maps API를 동적으로 로드하는 유틸리티
 *
 * 정적 script 태그 대신 동적으로 로드하는 이유
 * 1. 필요할 때만 로드하여 초기 로딩 시간 단축
 * 2. 환경 변수로 CLIENT_ID 관리 가능
 * 3. 로드 상태 관리 및 에러 처리 가능
 * 4. 코드 스플리팅 및 최적화 용이
 * 5. 중복 로드 방지 및 동시 호출 처리
 */

interface NaverMapLoaderOptions {
  clientId: string;
}

/**
 * Window 전역 타입 확장
 */
declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}

// 이미 로드된 스크립트를 찾기 위한 ID
const NAVER_MAP_SCRIPT_ID = 'naver-maps-sdk';
let loadingPromise: Promise<boolean> | null = null;

/**
 * Naver Maps API가 로드되었는지 확인
 */
export function isNaverMapLoaded(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.naver === 'object' &&
    window.naver !== null &&
    'maps' in window.naver &&
    window.naver.maps != null
  );
}

/**
 * Naver Maps API 스크립트를 동적으로 로드
 * @param options Naver Maps API 설정 옵션
 * @returns Promise<boolean> 로드 성공 여부
 */
export function loadNaverMapScript({
  clientId,
}: NaverMapLoaderOptions): Promise<boolean> {
  if (isNaverMapLoaded()) {
    return Promise.resolve(true);
  }

  if (!clientId) {
    return Promise.reject(
      new Error('Naver Maps API CLIENT_ID가 설정되지 않았습니다.'),
    );
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const promise = new Promise<boolean>((resolve, reject) => {
    const existing = document.getElementById(
      NAVER_MAP_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener('load', () => {
        resolve(isNaverMapLoaded());
      });

      existing.addEventListener('error', () => {
        reject(new Error('Naver Maps API 스크립트 로드에 실패했습니다.'));
      });
      return;
    }

    window.navermap_authFailure = () => {
      reject(
        new Error(
          'Naver Maps API 인증 실패 (Client ID / Web 서비스 URL 확인 필요)',
        ),
      );
      delete window.navermap_authFailure;
    };

    const script = document.createElement('script');
    script.id = NAVER_MAP_SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;

    script.onload = () => {
      if (isNaverMapLoaded()) {
        resolve(true);
      } else {
        reject(
          new Error(
            'Naver Maps API가 로드되었지만 window.naver.maps를 찾을 수 없습니다.',
          ),
        );
      }
    };

    script.onerror = () =>
      reject(new Error('Naver Maps API 스크립트 로드에 실패했습니다.'));

    document.head.appendChild(script);
  }).finally(() => {
    delete window.navermap_authFailure;
    loadingPromise = null;
  });

  loadingPromise = promise;
  return promise;
}

/**
 * Naver Maps API가 로드되었는지 확인
 */
export function checkNaverMapLoaded(): boolean {
  return isNaverMapLoaded();
}

/**
 * Naver Maps API가 로드될 때까지 기다리는 싱글톤 함수
 * 이미 로드되어 있으면 즉시 resolve, 아니면 polling으로 기다림
 * @returns Promise<void> naver.maps가 준비될 때까지 기다림
 */
let waitPromise: Promise<void> | null = null;

export function waitForNaverMap(
  options: WaitForNaverMapOptions = {},
): Promise<void> {
  const { intervalMs = 50, timeoutMs = 10_000 } = options;

  if (isNaverMapLoaded()) return Promise.resolve();
  if (waitPromise) return waitPromise;

  waitPromise = new Promise<void>((resolve, reject) => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      intervalId = null;
      timeoutId = null;
      waitPromise = null;
    };

    intervalId = setInterval(() => {
      if (isNaverMapLoaded()) {
        cleanup();
        resolve();
      }
    }, intervalMs);

    timeoutId = setTimeout(() => {
      if (!isNaverMapLoaded()) {
        cleanup();
        reject(
          new Error(
            'Naver Maps API 로드를 기다리는 중 타임아웃이 발생했습니다.',
          ),
        );
      } else {
        // 혹시라도 timeout 시점에 로드되어 있으면 그냥 정리만
        cleanup();
        resolve();
      }
    }, timeoutMs);
  });

  return waitPromise;
}
