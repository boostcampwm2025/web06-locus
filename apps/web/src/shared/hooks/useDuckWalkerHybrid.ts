import { useState, useCallback, useRef, useEffect } from 'react';
import { useDuckWalker, type DuckPosition } from '@/shared/hooks/useDuckWalker';
import { getRandomPointNear } from '@/shared/utils/duckWalkerUtils';

export interface UseDuckWalkerHybridOptions {
  idleIntervalMs?: number /** 평상시 배회 간격(ms). 기본 4000 */;
  wanderRadiusPx?: number /** 배회 시 이동 반경(px). 기본 80 */;
  enabled?: boolean /** idle 배회 활성화 여부. 기본 true */;
}

/**
 * 하이브리드 오리 워커: 평상시에는 근처를 랜덤 배회하고,
 * 목표(locus/기록 등)가 설정되면 그쪽으로 walkTo 합니다.
 *
 * - Idle: enabled이고 target이 없을 때, 일정 간격으로 반경 내 랜덤 지점으로 이동
 * - Event: setTarget(x, y) 호출 시 해당 지점으로 이동 (예: 사용자가 기록 카드 클릭, 항로 보기)
 */
export function useDuckWalkerHybrid(
  initialPos: DuckPosition = { x: 0, y: 0 },
  options: UseDuckWalkerHybridOptions = {},
) {
  const {
    idleIntervalMs = 4000,
    wanderRadiusPx = 80,
    enabled = true,
  } = options;

  const { pos, angle, isMoving, walkTo, setIsMoving } =
    useDuckWalker(initialPos);

  const [target, setTargetState] = useState<DuckPosition | null>(null);
  const posRef = useRef(pos);
  const isMovingRef = useRef(isMoving);
  posRef.current = pos;
  isMovingRef.current = isMoving;

  /** 사용자가 특정 지점(기록/항로 등)을 보고 있을 때 목표로 설정. 오리가 그쪽으로 걸어갑니다. */
  const setTarget = useCallback((t: DuckPosition | null) => {
    setTargetState(t);
  }, []);

  // 목표가 설정되면 그쪽으로 이동 후 목표 클리어
  useEffect(() => {
    if (target == null) return;
    walkTo(target.x, target.y);
    setTargetState(null);
  }, [target, walkTo]);

  // 평상시: 이동 중이 아니고, 목표가 없을 때 일정 간격으로 근처 랜덤 지점으로 배회
  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      if (isMovingRef.current) return;
      const near = getRandomPointNear(posRef.current, wanderRadiusPx);
      walkTo(near.x, near.y);
    }, idleIntervalMs);

    return () => clearInterval(id);
  }, [enabled, idleIntervalMs, wanderRadiusPx, walkTo]);

  return { pos, angle, isMoving, walkTo, setIsMoving, setTarget };
}
