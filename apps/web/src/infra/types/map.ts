import type { PinMarkerData } from '@/shared/types/marker';

/**
 * PinOverlay 컴포넌트 Props
 */
export interface PinOverlayProps {
  map: naver.maps.Map;
  pin: PinMarkerData;
  isSelected?: boolean;
  onClick?: (id: string | number) => void;
}

/**
 * PinOverlayView와 유사한 인터페이스
 * 순환 참조 방지를 위해 구조적 타입으로 정의
 */
export interface PinOverlayViewLike {
  setMap(map: naver.maps.Map | null): void;
  setPosition(pos: naver.maps.LatLng): void;
  setPin(pin: PinMarkerData): void;
  setIsSelected(v: boolean): void;
  setOnClick(fn?: (id: string | number) => void): void;
}
