import { createRoot } from 'react-dom/client';
import { PinMarker } from '@/shared/ui/marker';
import type { PinMarkerData } from '@/shared/types/marker';
import { isNaverMapLoaded } from '@/infra/map/naverMapLoader';

/**
 * 줌 레벨 관련 상수
 */
const ZOOM_CONFIG = {
  BASE_ZOOM: 13,
  MIN_SCALE: 0.4,
  MAX_SCALE: 2.0,
  SCALE_INCREMENT: 0.2,
} as const;

/**
 * 줌 레벨에 따른 scale 계산
 * 줌 13 기준: 줌 10 = 0.4배, 줌 13 = 1.0배, 줌 16 = 1.6배
 */
function calculateScale(currentZoom: number): number {
  const { BASE_ZOOM, MIN_SCALE, MAX_SCALE, SCALE_INCREMENT } = ZOOM_CONFIG;
  return Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, 1 + (currentZoom - BASE_ZOOM) * SCALE_INCREMENT),
  );
}

/**
 * OverlayView를 상속받는 커스텀 오버레이 클래스
 * Naver Maps API v3의 OverlayView를 사용하여 React 컴포넌트를 지도에 표시
 *
 * @see https://navermaps.github.io/maps.js.ncp/docs/tutorial-6-CustomOverlay.html
 */
class PinOverlayView extends naver.maps.OverlayView {
  private container: HTMLDivElement;
  private root: ReturnType<typeof createRoot>;
  private position: naver.maps.LatLng;
  private pin: PinMarkerData;
  private isSelected: boolean;
  private onClick?: (id: string | number) => void;

  constructor(
    position: naver.maps.LatLng,
    pin: PinMarkerData,
    isSelected: boolean,
    onClick?: (id: string | number) => void,
  ) {
    super();
    this.position = position;
    this.pin = pin;
    this.isSelected = isSelected;
    this.onClick = onClick;

    // 컨테이너 생성
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.left = '0';
    this.container.style.top = '0';
    this.container.style.transform = 'translate(-50%, -100%)'; // 핀 하단 기준 정렬

    // React root 생성
    this.root = createRoot(this.container);
  }

  /**
   * 지도에 오버레이를 추가할 때 호출
   * overlayLayer에 컨테이너를 추가하고 React 컴포넌트를 렌더링
   */
  onAdd(): void {
    const overlayLayer = this.getPanes()?.overlayLayer;
    if (overlayLayer) {
      overlayLayer.appendChild(this.container);
    }

    // React 컴포넌트 렌더링
    this.renderPin();
  }

  /**
   * 지도에 오버레이를 그려야 할 때 호출
   * 지도 좌표를 화면 좌표로 변환하여 위치 업데이트
   * 줌 레벨에 따라 크기 조절
   */
  draw(): void {
    if (!this.getMap()) {
      return;
    }

    const projection = this.getProjection();
    if (!projection) {
      return;
    }

    // LatLng 좌표를 화면 좌표(픽셀)로 변환
    const pixelPosition = projection.fromCoordToOffset(this.position);

    // 핀 하단 기준으로 정렬 (xAnchor: 0.5, yAnchor: 1)
    this.container.style.left = `${pixelPosition.x}px`;
    this.container.style.top = `${pixelPosition.y}px`;

    const currentZoom = this.getMap()?.getZoom() ?? ZOOM_CONFIG.BASE_ZOOM;
    const scale = calculateScale(currentZoom);

    // transform에 scale 추가 (기존 translate 유지)
    // transformOrigin을 50% 100%로 설정하여 핀 하단 기준으로 스케일
    this.container.style.transform = `translate(-50%, -100%) scale(${scale})`;
    this.container.style.transformOrigin = '50% 100%';
  }

  /**
   * 지도에서 오버레이가 삭제될 때 호출
   * React root를 unmount하고 DOM 요소 제거
   */
  onRemove(): void {
    // React 렌더링 완료 후 unmount하도록 비동기 처리
    void Promise.resolve().then(() => {
      this.root.unmount();
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    });
  }

  /**
   * 오버레이의 위치를 업데이트
   * @param position 새로운 위치 좌표
   */
  setPosition(position: naver.maps.LatLng): void {
    this.position = position;
    this.draw();
  }

  /**
   * 핀 마커 데이터를 업데이트
   * @param pin 새로운 핀 마커 데이터
   */
  setPin(pin: PinMarkerData): void {
    this.pin = pin;
    this.renderPin();
  }

  /**
   * 선택 상태를 업데이트
   * @param isSelected 선택 여부
   */
  setIsSelected(isSelected: boolean): void {
    this.isSelected = isSelected;
    this.renderPin();
  }

  /**
   * 클릭 핸들러를 업데이트
   * @param onClick 클릭 핸들러 함수
   */
  setOnClick(onClick?: (id: string | number) => void): void {
    this.onClick = onClick;
    this.renderPin();
  }

  /**
   * React 컴포넌트를 렌더링
   * PinMarker 컴포넌트를 root에 렌더링하여 지도에 표시
   */
  private renderPin(): void {
    this.root.render(
      <PinMarker
        pin={this.pin}
        isSelected={this.isSelected}
        onClick={this.onClick}
      />,
    );
  }
}

/**
 * OverlayView를 상속받는 커스텀 오버레이 클래스를 동적으로 생성
 * 네이버 맵이 로드된 후에만 클래스를 생성하여 "naver is not defined" 에러 방지
 */
function createPinOverlayViewClass() {
  if (!isNaverMapLoaded()) {
    throw new Error('Naver Maps API가 로드되지 않았습니다.');
  }
  return PinOverlayView;
}

/**
 * PinOverlayView 클래스 타입
 * 익명 클래스 타입 문제를 해결하기 위해 명시적으로 타입을 export
 */
export type PinOverlayViewClass = typeof PinOverlayView;

// 클래스를 lazy하게 생성하기 위한 변수
let PinOverlayViewClassInstance: PinOverlayViewClass | null = null;

/**
 * PinOverlayView 클래스를 가져옴
 * 네이버 맵이 로드된 후에만 클래스를 생성하여 반환
 * @returns PinOverlayView 클래스
 */
export function getPinOverlayViewClass(): PinOverlayViewClass {
  PinOverlayViewClassInstance ??= createPinOverlayViewClass();
  return PinOverlayViewClassInstance;
}

/**
 * PinOverlayView 인스턴스 타입
 * 순환 참조 방지를 위해 타입 선언
 */
export type PinOverlayViewInstance = InstanceType<PinOverlayViewClass>;
