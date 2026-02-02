export interface Point2D {
  x: number;
  y: number;
}

/**
 * 현재 위치를 중심으로 반경 radius(px) 안의 랜덤한 한 점을 반환합니다.
 * 자유 배회(idle wander) 시 근처로 조금씩 이동할 때 사용합니다.
 *
 * @param center - 중심 좌표 (픽셀)
 * @param radius - 반경(px). 이 거리 이내의 점을 반환
 * @returns { x, y } 픽셀 좌표
 */
export function getRandomPointNear(center: Point2D, radius: number): Point2D {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  return {
    x: center.x + Math.cos(angle) * distance,
    y: center.y + Math.sin(angle) * distance,
  };
}

/**
 * 사각형 영역 안의 랜덤한 한 점을 반환합니다.
 * 지도 뷰포트 내에서 완전히 랜덤한 목적지를 찍을 때 사용합니다.
 *
 * @param rect - { left, top, width, height } 또는 { x, y, width, height }
 * @returns { x, y } 픽셀 좌표 (rect 내부)
 */
export function getRandomPointInRect(rect: {
  left?: number;
  x?: number;
  top?: number;
  y?: number;
  width: number;
  height: number;
}): Point2D {
  const x0 = rect.left ?? rect.x ?? 0;
  const y0 = rect.top ?? rect.y ?? 0;
  return {
    x: x0 + Math.random() * rect.width,
    y: y0 + Math.random() * rect.height,
  };
}
