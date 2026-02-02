import { useState, useCallback, useRef } from 'react';
import type { DuckPosition } from '@/shared/types/duck';

export type { DuckPosition };

/**
 * 오리 마스코트의 위치·방향·이동 상태를 관리하는 훅.
 * 목적지 (targetX, targetY)를 주면 현재 위치에서 목적지 방향으로 각도를 계산하고,
 * 위치를 목적지로 업데이트합니다. 실제 이동 애니메이션은 컴포넌트(motion 등)에서 처리합니다.
 */
export function useDuckWalker(initialPos: DuckPosition = { x: 0, y: 0 }) {
  const [pos, setPos] = useState<DuckPosition>(initialPos);
  const [angle, setAngle] = useState(90); // 기본 남쪽
  const [isMoving, setIsMoving] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const walkTo = useCallback((targetX: number, targetY: number) => {
    const current = posRef.current;
    const dx = targetX - current.x;
    const dy = targetY - current.y;
    const newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedAngle = newAngle < 0 ? newAngle + 360 : newAngle;

    setAngle(normalizedAngle);
    setIsMoving(true);
    setPos({ x: targetX, y: targetY });
  }, []);

  return { pos, angle, isMoving, walkTo, setIsMoving };
}
