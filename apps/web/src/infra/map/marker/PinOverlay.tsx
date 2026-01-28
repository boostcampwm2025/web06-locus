import { useEffect, useRef } from 'react';
import { getPinOverlayViewClass } from './PinOverlayView';
import {
  createOverlayInstance,
  updateOverlay,
  cleanupOverlay,
} from './pinOverlayHelpers';
import type { PinOverlayProps, PinOverlayViewLike } from '@/infra/types/map';

/**
 * Naver Maps OverlayView를 사용하여 React PinMarker 컴포넌트를 지도에 표시
 *
 * @example
 * ```tsx
 * <PinOverlay
 *   map={mapInstance}
 *   pin={{
 *     id: 1,
 *     position: { lat: 37.5665, lng: 126.978 },
 *     variant: 'current',
 *   }}
 *   isSelected={false}
 *   onClick={(id) => console.warn('clicked', id)}
 * />
 * ```
 */
export default function PinOverlay({
  map,
  pin,
  isSelected = false,
  onClick,
}: PinOverlayProps) {
  const overlayRef = useRef<PinOverlayViewLike | null>(null);

  // map이 변경될 때만 오버레이 생성/재생성
  useEffect(() => {
    if (!map) return;

    try {
      // 지도가 로드된 후에는 클래스가 이미 초기화되어 있음
      const PinOverlayView = getPinOverlayViewClass();

      if (!overlayRef.current) {
        overlayRef.current = createOverlayInstance(
          PinOverlayView,
          pin,
          isSelected,
          onClick,
        );
        overlayRef.current.setMap(map);
      } else {
        // map이 변경되었으면 재생성
        overlayRef.current.setMap(null);
        overlayRef.current = createOverlayInstance(
          PinOverlayView,
          pin,
          isSelected,
          onClick,
        );
        overlayRef.current.setMap(map);
      }
    } catch (error) {
      console.error('PinOverlayView 클래스를 가져오는 중 오류 발생:', error);
    }

    return () => {
      if (overlayRef.current) {
        cleanupOverlay(overlayRef.current);
        overlayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // map만 의존성으로

  useEffect(() => {
    if (!overlayRef.current) return;
    updateOverlay(overlayRef.current, pin, isSelected, onClick);
  }, [pin, isSelected, onClick]);

  // OverlayView는 DOM에 직접 렌더링되므로 null 반환
  return null;
}
