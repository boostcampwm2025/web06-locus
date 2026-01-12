import type { PinMarkerData } from '@/shared/types/marker';
import { getPinOverlayViewClass } from './PinOverlayView';
import type { PinOverlayViewLike } from '@/infra/types/map';

/**
 * 오버레이 인스턴스 생성
 */
export function createOverlayInstance(
  PinOverlayView: ReturnType<typeof getPinOverlayViewClass>,
  pin: PinMarkerData,
  isSelected: boolean,
  onClick?: (id: string | number) => void,
): PinOverlayViewLike {
  const position = new naver.maps.LatLng(pin.position.lat, pin.position.lng);
  return new PinOverlayView(position, pin, isSelected, onClick);
}

/**
 * 오버레이 업데이트 (위치, 핀 데이터, 선택 상태, 클릭 핸들러)
 */
export function updateOverlay(
  overlay: PinOverlayViewLike,
  pin: PinMarkerData,
  isSelected: boolean,
  onClick?: (id: string | number) => void,
): void {
  const position = new naver.maps.LatLng(pin.position.lat, pin.position.lng);

  overlay.setPosition(position);
  overlay.setPin(pin);
  overlay.setIsSelected(isSelected);
  overlay.setOnClick(onClick);
}

/**
 * 오버레이 정리 (cleanup)
 * 오버레이 인스턴스에서 지도를 제거
 */
export function cleanupOverlay(overlay: PinOverlayViewLike | null): void {
  if (overlay) {
    overlay.setMap(null);
  }
}
