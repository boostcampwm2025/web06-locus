import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_MESSAGE = '잠을 자도 피로가 안 풀리냐덕?';
const DISPLAY_DURATION = 3000; // 말풍선 유지 시간 (3초)

export interface DuckWithSpeechBubbleProps {
  children: React.ReactNode;
  comments?: string[] /** 오리 API에서 받은 코멘트 풀 */;
  message?: string /** comments가 없거나 비었을 때 사용할 기본 메시지 */;
  size?: number;
  className?: string;
}

/**
 * 오리 클릭 시 말풍선을 띄우는 공통 래퍼.
 * 한 바퀴 돌 때까지 중복 없이 대사를 보여주는 셔플 로직 적용.
 */
export function DuckWithSpeechBubble({
  children,
  comments = [],
  message = DEFAULT_MESSAGE,
  size = 80,
  className = '',
}: DuckWithSpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState(message);

  // 아직 사용하지 않은 대사들의 인덱스 번호
  const [unusedIndices, setUnusedIndices] = useState<number[]>([]);

  const getNextComment = useCallback(() => {
    if (!comments || comments.length === 0) return message;

    let currentIndices = [...unusedIndices];

    // 인덱스 풀 비워졌으면(새 바퀴 시작) 새로 인덱스 풀을 채우고 섞음
    if (currentIndices.length === 0) {
      currentIndices = Array.from({ length: comments.length }, (_, i) => i);
      // 피셔-예이츠 셔플 알고리즘(간략화)
      for (let i = currentIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentIndices[i], currentIndices[j]] = [
          currentIndices[j],
          currentIndices[i],
        ];
      }
    }

    // 마지막 인덱스 하나를 추출
    const nextIndex = currentIndices.pop()!;
    setUnusedIndices(currentIndices);

    return comments[nextIndex] ?? message;
  }, [comments, message, unusedIndices]);

  /**
   * 자동 사라짐 타이머 설정
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, DISPLAY_DURATION);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible]);

  const toggleBubble = () => {
    const nextVisibility = !isVisible;
    if (nextVisibility) {
      // 말풍선이 열릴 때만 새로운 대사를 세팅
      setDisplayedMessage(getNextComment());
    }
    setIsVisible(nextVisibility);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBubble();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleBubble();
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer outline-none ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="오리 말풍선 보기"
    >
      <div className="absolute bottom-full mb-6 z-10 left-1/2 -translate-x-1/2 w-max max-w-[420px] pointer-events-none">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 5,
                transition: { duration: 0.2 },
              }}
              className="relative"
            >
              {/* Bubble Body */}
              <div className="bg-white px-7 py-4 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100/80 backdrop-blur-sm">
                <p className="text-[15px] font-medium text-gray-800 leading-[1.6] break-keep text-center">
                  {displayedMessage}
                </p>
              </div>

              {/* Bubble Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r border-b border-gray-100/80 rotate-45 shadow-[4px_4px_10px_-2px_rgba(0,0,0,0.05)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}
