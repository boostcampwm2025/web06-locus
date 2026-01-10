import type { Coordinates } from '@/features/record/types';

/**
 * Window 전역 타입 확장
 */
declare global {
  interface Window {
    naver?: {
      maps?: typeof naver.maps;
    };
    navermap_authFailure?: () => void;
  }
}

/**
 * Naver Maps 타입 확장
 * Coordinates 타입과 LatLng 간의 호환성 개선
 */
declare namespace naver.maps {
  interface LatLngConstructor {
    new (lat: number, lng: number): LatLng;
    new (lat: number | string, lng: number | string): LatLng;
    // Coordinates 타입과의 호환성을 위한 오버로드
    new (coordinates: Coordinates): LatLng;
  }
}
