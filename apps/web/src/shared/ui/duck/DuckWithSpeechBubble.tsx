import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_MESSAGE = '잠을 자도 피로가 안 풀리냐';

function pickRandomComment(comments: string[]): string {
  if (comments.length === 0) return DEFAULT_MESSAGE;
  return (
    comments[Math.floor(Math.random() * comments.length)] ?? DEFAULT_MESSAGE
  );
}

export interface DuckWithSpeechBubbleProps {
  children: React.ReactNode;
  comments?: string[] /** 오리 API에서 받은 코멘트 풀. 있으면 말풍선 열릴 때 랜덤 1개 표시 */;
  message?: string /** comments가 없거나 비었을 때 사용할 메시지 */;
  size?: number /** 클릭 영역 크기(px). 오리 크기와 맞출 것 */;
  className?: string;
}

/**
 * 오리 클릭 시 말풍선을 띄우는 공통 래퍼.
 * DuckMapScene, DuckMapSceneHybrid, DuckMapSceneCrossing 등 모든 오리 시나리오에서 사용.
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isVisible;
    if (next) {
      setDisplayedMessage(
        comments.length > 0 ? pickRandomComment(comments) : message,
      );
    }
    setIsVisible(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const next = !isVisible;
      if (next) {
        setDisplayedMessage(
          comments.length > 0 ? pickRandomComment(comments) : message,
        );
      }
      setIsVisible(next);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="오리 말풍선 보기"
    >
      <div className="absolute bottom-full mb-6 z-10 left-1/2 -translate-x-1/2 w-max max-w-[420px]">
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
