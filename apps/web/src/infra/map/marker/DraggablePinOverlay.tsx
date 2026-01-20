import { useEffect, useRef } from 'react';
import { getPinOverlayViewClass } from './PinOverlayView';
import {
  createOverlayInstance,
  updateOverlay,
  cleanupOverlay,
} from './pinOverlayHelpers';
import type {
  PinOverlayViewLike,
  DraggablePinOverlayProps,
  NaverCoordLike,
  OverlayInternal,
  DragState,
} from '@/infra/types/map';
import type { Coordinates } from '@/features/record/types';

/** overlay별 cleanup을 any 없이 관리 */
const dragCleanupMap = new WeakMap<PinOverlayViewLike, () => void>();

export default function DraggablePinOverlay({
  map,
  pin,
  isSelected = false,
  onClick,
  onDragEnd,
}: DraggablePinOverlayProps) {
  const overlayRef = useRef<PinOverlayViewLike | null>(null);
  const dragStateRef = useRef<DragState>({ dragging: false, grabOffset: null });

  // 최신 콜백을 이벤트 핸들러에서 쓰기 위한 ref
  const onDragEndRef = useLatestRef(onDragEnd);

  // 핀 업데이트에 필요한 최신 props ref (overlay 업데이트용)
  const onClickRef = useLatestRef(onClick);
  const isSelectedRef = useLatestRef(isSelected);
  const pinRef = useLatestRef(pin);

  // map이 들어오면 overlay 생성 / map이 바뀌면 정리 후 재생성
  useEffect(() => {
    if (!map) return;

    // 1) overlay 생성
    const PinOverlayView = getPinOverlayViewClass();
    const overlay = createOverlayInstance(
      PinOverlayView,
      pinRef.current,
      isSelectedRef.current,
      onClickRef.current,
    );

    overlay.setMap(map);
    overlayRef.current = overlay;

    // 2) drag listeners 등록
    addDragListeners(overlay, map, dragStateRef, onDragEndRef);

    // 3) cleanup
    return () => {
      if (overlayRef.current) {
        removeDragListeners(overlayRef.current);
        cleanupOverlay(overlayRef.current);
        overlayRef.current = null;
      }
    };
    // map만 의존: 나머지는 latest ref로 해결
  }, [map, onClickRef, isSelectedRef, pinRef, onDragEndRef]);

  // pin/isSelected/onClick 변경 시 overlay만 업데이트
  useEffect(() => {
    if (!overlayRef.current) return;
    updateOverlay(overlayRef.current, pin, isSelected, onClick);
  }, [pin, isSelected, onClick]);

  return null;
}

/** 최신 콜백/값을 effect 의존성에 넣지 않고 사용하기 위한 패턴 */
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

/** Coord/LatLng에서 숫자 좌표 뽑기 */
function toCoordinates(pos: NaverCoordLike): Coordinates {
  // LatLng 형태(함수 lat/lng 제공)
  if (isLatLng(pos)) {
    return { lat: pos.lat(), lng: pos.lng() };
  }
  // Coord 형태(x=lng, y=lat)
  return { lat: pos.y, lng: pos.x };
}

/** LatLng인지 타입 가드 (런타임 체크) */
function isLatLng(pos: NaverCoordLike): pos is naver.maps.LatLng {
  return (
    typeof (pos as naver.maps.LatLng).lat === 'function' &&
    typeof (pos as naver.maps.LatLng).lng === 'function'
  );
}

/** OverlayView.getProjection()은 null일 수 있어 안전하게 꺼내기 */
function getProjectionSafe(overlay: PinOverlayViewLike) {
  const ov = overlay as unknown as naver.maps.OverlayView;
  return ov.getProjection?.() ?? null;
}

/** overlay 내부(container/position) 접근 */
function getOverlayInternal(overlay: PinOverlayViewLike): OverlayInternal {
  return overlay as unknown as OverlayInternal;
}

/** map container element 얻기 */
function getMapElement(map: naver.maps.Map): HTMLElement | null {
  // 네이버 지도는 getElement() 제공
  return map.getElement?.() ?? null;
}

function addDragListeners(
  overlay: PinOverlayViewLike,
  map: naver.maps.Map,
  dragStateRef: React.MutableRefObject<DragState>,
  onDragEndRef: React.MutableRefObject<DraggablePinOverlayProps['onDragEnd']>,
) {
  const internal = getOverlayInternal(overlay);
  const container = internal.container;

  if (!container) return;

  container.style.cursor = 'grab';
  container.style.userSelect = 'none';
  container.style.touchAction = 'none'; // 모바일에서 스크롤/줌 제스처 간섭 감소

  const mapEl = getMapElement(map);
  if (!mapEl) return;

  const startDrag = (clientX: number, clientY: number) => {
    const projection = getProjectionSafe(overlay);
    const pos = internal.position;

    if (!projection || !pos) return;

    // 핀 중심(overlay position)의 화면 좌표
    const pinScreenPoint: naver.maps.Point = projection.fromCoordToOffset(pos);

    dragStateRef.current.dragging = true;
    dragStateRef.current.grabOffset = {
      x: clientX - pinScreenPoint.x,
      y: clientY - pinScreenPoint.y,
    };

    container.style.cursor = 'grabbing';
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const { dragging, grabOffset } = dragStateRef.current;
    if (!dragging || !grabOffset) return;

    const projection = getProjectionSafe(overlay);
    if (!projection) return;

    const rect = mapEl.getBoundingClientRect();

    // 포인터의 현재 위치(지도 컨테이너 기준)에서 grabOffset을 빼서 “핀 중심이 가야 할 화면 좌표”를 만든다
    const targetX = clientX - rect.left - grabOffset.x;
    const targetY = clientY - rect.top - grabOffset.y;

    // 화면 좌표 -> 지도 좌표(Coord 또는 LatLng)
    const coord: NaverCoordLike = projection.fromOffsetToCoord(
      new naver.maps.Point(targetX, targetY),
    );

    overlay.setPosition(coord as naver.maps.LatLng);
    internal.position = coord;
  };

  const endDrag = () => {
    if (!dragStateRef.current.dragging) return;

    dragStateRef.current.dragging = false;
    dragStateRef.current.grabOffset = null;
    container.style.cursor = 'grab';

    const finalPos = internal.position;
    const cb = onDragEndRef.current;

    if (cb && finalPos) {
      cb(toCoordinates(finalPos));
    }
  };

  // Mouse handlers
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragStateRef.current.dragging) return;
    e.preventDefault();
    e.stopPropagation();
    moveDrag(e.clientX, e.clientY);
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!dragStateRef.current.dragging) return;
    e.preventDefault();
    e.stopPropagation();
    endDrag();
  };

  // Touch handlers
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragStateRef.current.dragging) return;
    if (e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!dragStateRef.current.dragging) return;
    e.preventDefault();
    e.stopPropagation();
    endDrag();
  };

  // attach
  container.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  container.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });

  // cleanup 저장 (WeakMap)
  dragCleanupMap.set(overlay, () => {
    container.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    container.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  });
}

function removeDragListeners(overlay: PinOverlayViewLike) {
  const cleanup = dragCleanupMap.get(overlay);
  if (cleanup) {
    cleanup();
    dragCleanupMap.delete(overlay);
  }
}
