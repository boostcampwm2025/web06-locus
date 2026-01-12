import type { Coordinates } from '@/features/record/types';

/**
 * 지도 인스턴스 훅 옵션
 */
export interface UseMapInstanceOptions {
  initialCoordinates?: Coordinates;
  useGeolocation?: boolean;
  zoom?: number;
  zoomControl?: boolean;
  zoomControlOptions?: {
    position?: number; // naver.maps.Position enum 값 (지도 로드 전에는 숫자로 전달)
  };
  defaultCenter?: Coordinates;

  onMapReady?: (map: naver.maps.Map) => void; // 지도 로드 후 특수 로직
  autoCenterToGeolocation?: boolean; // 현재 위치로 자동 중심 이동
}
