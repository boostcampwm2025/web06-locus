import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DuckSprite } from './DuckSprite';
import { useDuckWalker } from '@/shared/hooks/useDuckWalker';
import { getCrossingPathEndpoints } from '@/shared/utils/duckWalkerUtils';
import type { DuckPosition } from '@/shared/hooks/useDuckWalker';

const DUCK_SIZE = 80;
const HALF = DUCK_SIZE / 2;
const WALK_DURATION = 2;

export interface DuckMapSceneCrossingProps {
  containerSize: {
    width: number;
    height: number;
  } /** 컨테이너 크기(px). 이 크기 기준으로 끝→끝 경로 생성 */;
  duration?: number /** 이동 애니메이션 시간(초). 기본 25 */;
  bounce?: boolean /** 이동 중 위아래로 살짝 튀는 보조 애니메이션. 기본 true */;
  height?: number | string /** 컨테이너 높이. '100%' 등 (레이아웃용) */;
  className?: string;
}

/**
 * 맵 한쪽 끝에서 반대쪽 끝으로 계속 걸어가는 오리 씬.
 * onAnimationComplete에서 즉시 다음 경로를 주입해 멈춤 없이 연속 이동.
 * y축에 변화를 주어 자연스럽게 보이게 함.
 * 레이어는 pointer-events: none, 오리만 pointer-events: auto (지도/마커 클릭 가능).
 */
export function DuckMapSceneCrossing({
  containerSize,
  duration = WALK_DURATION,
  bounce = true,
  height = '100%',
  className = '',
}: DuckMapSceneCrossingProps) {
  const { width, height: h } = containerSize;
  const firstStart: DuckPosition = { x: -50, y: h / 2 };

  const { pos, angle, isMoving, walkTo, setIsMoving } =
    useDuckWalker(firstStart);

  const fromLeftRef = useRef(true);
  const hasStartedRef = useRef(false);
  const sizeRef = useRef(containerSize);
  const walkToRef = useRef(walkTo);
  sizeRef.current = containerSize;
  walkToRef.current = walkTo;

  // 첫 경로: 왼쪽 → 오른쪽, 한 번만 출발
  useEffect(() => {
    if (width <= 0 || h <= 0) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const [, end] = getCrossingPathEndpoints(width, h, true);
    walkTo(end.x, end.y);
    fromLeftRef.current = false; // 다음은 오른쪽 → 왼쪽
  }, [width, h, walkTo]);

  const scheduleNextPath = () => {
    setIsMoving(false);
    const size = sizeRef.current;
    if (size.width <= 0 || size.height <= 0) return;
    const fromLeft = fromLeftRef.current;
    const [, end] = getCrossingPathEndpoints(size.width, size.height, fromLeft);
    walkToRef.current(end.x, end.y);
    fromLeftRef.current = !fromLeft;
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: height ?? '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute left-0 top-0 z-10 will-change-transform"
        animate={{ x: pos.x - HALF, y: pos.y - HALF }}
        transition={{
          type: 'tween',
          ease: 'linear',
          duration,
        }}
        onAnimationComplete={scheduleNextPath}
        style={{
          width: DUCK_SIZE,
          height: DUCK_SIZE,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      >
        <motion.div
          className="flex items-center justify-center"
          style={{ width: DUCK_SIZE, height: DUCK_SIZE }}
          animate={bounce && isMoving ? { y: [0, -4, 0] } : { y: 0 }}
          transition={
            bounce && isMoving
              ? { repeat: Infinity, duration: 0.28, ease: 'easeInOut' }
              : { duration: 0 }
          }
        >
          <DuckSprite angle={angle} size={DUCK_SIZE} />
        </motion.div>
      </motion.div>
    </div>
  );
}
