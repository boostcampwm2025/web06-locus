import { useEffect } from 'react';
import { motion } from 'motion/react';
import { DuckSprite } from './DuckSprite';
import { DuckWithSpeechBubble } from './DuckWithSpeechBubble';
import { useDuckWalkerHybrid } from '@/shared/hooks/useDuckWalkerHybrid';
import type { UseDuckWalkerHybridOptions } from '@/shared/hooks/useDuckWalkerHybrid';
import type { DuckPosition } from '@/shared/hooks/useDuckWalker';

const DUCK_SIZE = 80;
const HALF = DUCK_SIZE / 2;
const WALK_DURATION = 2;

export interface DuckMapSceneHybridProps {
  children?: React.ReactNode /** 오리 뒤에 깔릴 콘텐츠(지도 등). 없으면 배경 없이 오리만 표시 */;
  initialPos?: DuckPosition /** 초기 위치 (픽셀) */;
  /** 컨테이너 높이. px 숫자 또는 '100%' (부모 높이에 맞춤) */
  height?: number | string;
  duration?: number /** 이동 애니메이션 시간(초). 기본 2 */;
  bounce?: boolean /** 이동 중 위아래로 살짝 튀는 보조 애니메이션. 기본 true */;
  hint?: string | null /** 안내 문구. 없거나 빈 문자열이면 렌더하지 않음 */;
  /** false면 레이어는 클릭 통과(pointer-events: none), 오리만 클릭 가능. 지도 위 레이어일 때 true 권장 */
  clickThrough?: boolean;
  target?: DuckPosition | null /** 지정 경로(이벤트): 이 좌표가 설정되면 오리가 그쪽으로 걸어갑니다. (예: 기록/항로 선택 시) */;
  wanderOptions?: UseDuckWalkerHybridOptions /** idle 배회 옵션 */;
  className?: string;
}

/**
 * 하이브리드 오리 씬: 평상시 근처를 랜덤 배회하고,
 * target이 설정되면(예: 사용자가 기록/항로 선택) 그 지점으로 걸어갑니다.
 * clickThrough=true면 레이어는 클릭 통과, 오리만 클릭 가능(지도/마커 클릭 가능).
 */
export function DuckMapSceneHybrid({
  children,
  initialPos = { x: 120, y: 200 },
  height = 500,
  duration = WALK_DURATION,
  bounce = true,
  hint = null,
  clickThrough = false,
  target = null,
  wanderOptions = {},
  className = '',
}: DuckMapSceneHybridProps) {
  const { pos, angle, isMoving, walkTo, setIsMoving, setTarget } =
    useDuckWalkerHybrid(initialPos, wanderOptions);

  // 부모가 target을 주면(기록/항로 선택 등) 그쪽으로 이동
  useEffect(() => {
    if (target != null) setTarget(target);
  }, [target?.x, target?.y, setTarget]);

  const handleClick = clickThrough
    ? undefined
    : (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        walkTo(e.clientX - rect.left, e.clientY - rect.top);
      };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: height ?? 500,
        pointerEvents: clickThrough ? 'none' : undefined,
      }}
      onClick={handleClick}
      role={clickThrough ? undefined : 'button'}
      tabIndex={clickThrough ? undefined : 0}
      onKeyDown={
        clickThrough
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
            }
      }
      aria-label={clickThrough ? undefined : '클릭한 위치로 오리가 이동합니다'}
    >
      {children != null ? (
        <div className="absolute inset-0 z-0">{children}</div>
      ) : null}
      {hint ? (
        <p className="absolute left-4 top-4 z-10 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}

      <motion.div
        className="absolute left-0 top-0 z-10 will-change-transform"
        animate={{ x: pos.x - HALF, y: pos.y - HALF }}
        transition={{
          type: 'tween',
          ease: 'linear',
          duration,
        }}
        onAnimationComplete={() => setIsMoving(false)}
        style={{
          width: DUCK_SIZE,
          height: DUCK_SIZE,
          pointerEvents: clickThrough ? 'auto' : undefined,
          cursor: clickThrough ? 'pointer' : undefined,
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
          <DuckWithSpeechBubble size={DUCK_SIZE}>
            <DuckSprite angle={angle} size={DUCK_SIZE} />
          </DuckWithSpeechBubble>
        </motion.div>
      </motion.div>
    </div>
  );
}
