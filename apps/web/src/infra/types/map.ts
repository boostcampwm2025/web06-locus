import type { PinMarkerData } from '@/shared/types/marker';
import type { Coordinates } from '@/features/record/types';

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

/**
 * waitForNaverMap 함수의 옵션
 */
export interface WaitForNaverMapOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

/**
 * 드래그 가능한 PinOverlay 컴포넌트 Props
 */
export interface DraggablePinOverlayProps extends PinOverlayProps {
  onDragEnd?: (position: Coordinates) => void;
}

/**
 * 네이버 지도 타입이 환경/버전에 따라 Coord/LatLng로 섞여 들어오는 걸 안전하게 다루기 위한 유니온
 */
export type NaverCoordLike = naver.maps.Coord | naver.maps.LatLng;

/**
 * Overlay 인스턴스가 내부적으로 들고 있는 DOM/position에 접근하기 위한 최소 형태
 */
export interface OverlayInternal {
  container?: HTMLDivElement;
  position?: NaverCoordLike;
}

/**
 * 드래그 상태
 */
export interface DragState {
  dragging: boolean;
  grabOffset: { x: number; y: number } | null; // (마우스/터치 포인터 - 핀 중심) 오프셋
}

/**
 * 지오코딩 API 응답의 주소 정보
 */
export interface GeocodeAddress {
  title: string;
  roadAddress: string;
  jibunAddress: string;
  latitude: string;
  longitude: string;
}

export interface GeocodeData {
  meta: {
    totalCount: number;
  };
  addresses: GeocodeAddress[];
}

/**
 * 지오코딩 API 응답
 */
export interface GeocodeResponse {
  status: 'success';
  data: GeocodeData;
}
