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

const OFF_SCREEN_PADDING = 50;
const Y_MARGIN_RATIO = 0.2; // 상하 20% 여백
const Y_VARIATION_RATIO = 0.25; // y끝 = y시작 ± 높이의 25% 이내

/**
 * 맵 한쪽 끝에서 반대쪽 끝으로 가는 경로의 시작·끝점 생성.
 * y축에 변화를 주어 자연스럽게 보이게 함.
 *
 * @param width - 컨테이너 너비(px)
 * @param height - 컨테이너 높이(px)
 * @param fromLeft - true면 왼쪽→오른쪽, false면 오른쪽→왼쪽
 * @returns [시작점, 끝점] (픽셀)
 */
export function getCrossingPathEndpoints(
  width: number,
  height: number,
  fromLeft: boolean,
): [Point2D, Point2D] {
  const margin = height * Y_MARGIN_RATIO;
  const yMin = margin;
  const yMax = height - margin;
  const y1 = yMin + Math.random() * (yMax - yMin);
  const variation = height * Y_VARIATION_RATIO;
  const y2 = Math.max(
    yMin,
    Math.min(yMax, y1 + (Math.random() * 2 - 1) * variation),
  );

  if (fromLeft) {
    return [
      { x: -OFF_SCREEN_PADDING, y: y1 },
      { x: width + OFF_SCREEN_PADDING, y: y2 },
    ];
  }
  return [
    { x: width + OFF_SCREEN_PADDING, y: y1 },
    { x: -OFF_SCREEN_PADDING, y: y2 },
  ];
}
