import { motion } from 'motion/react';
import { DuckSprite } from './DuckSprite';
import { DuckWithSpeechBubble } from './DuckWithSpeechBubble';
import { useDuckWalker } from '@/shared/hooks/useDuckWalker';

const DUCK_SIZE = 80;
const HALF = DUCK_SIZE / 2;
const WALK_DURATION = 2;

export interface DuckMapSceneProps {
  initialPos?: {
    x: number;
    y: number;
  } /** 초기 위치 (픽셀). 기본 { x: 50, y: 50 } */;
  height?: number /** 컨테이너 높이(px). 기본 500 */;
  duration?: number /** 이동 애니메이션 시간(초). 기본 2 */;
  bounce?: boolean /** 이동 중 위아래로 살짝 튀는 보조 애니메이션 사용 여부. 기본 true */;
  hint?: string /** 안내 문구. 없으면 기본 문구 표시 */;
  /** 오리 말풍선용 코멘트 풀. 있으면 클릭 시 랜덤 1개 표시 */
  comments?: string[];
  className?: string;
}

/**
 * 클릭한 위치로 오리가 걸어가는 연출을 보여주는 씬.
 * 지도 위 레이어처럼 사용하거나, 스토리북에서 동작 확인용으로 쓸 수 있습니다.
 */
export function DuckMapScene({
  initialPos = { x: 50, y: 50 },
  height = 500,
  duration = WALK_DURATION,
  bounce = true,
  hint = '지도 위를 클릭하면 오리가 걸어갑니다!',
  comments = [],
  className = '',
}: DuckMapSceneProps) {
  const { pos, angle, isMoving, walkTo, setIsMoving } =
    useDuckWalker(initialPos);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    walkTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-slate-100 ${className}`}
      style={{ height }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
      }}
      aria-label="클릭한 위치로 오리가 이동합니다"
    >
      <p className="absolute left-4 top-4 z-10 text-xs text-slate-500">
        {hint}
      </p>

      <motion.div
        className="absolute left-0 top-0 will-change-transform"
        animate={{ x: pos.x - HALF, y: pos.y - HALF }}
        transition={{
          type: 'tween',
          ease: 'linear',
          duration,
        }}
        onAnimationComplete={() => setIsMoving(false)}
        style={{ width: DUCK_SIZE, height: DUCK_SIZE }}
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
          <DuckWithSpeechBubble size={DUCK_SIZE} comments={comments}>
            <DuckSprite angle={angle} size={DUCK_SIZE} />
          </DuckWithSpeechBubble>
        </motion.div>
      </motion.div>
    </div>
  );
}
