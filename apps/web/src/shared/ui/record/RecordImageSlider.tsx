import { useState, useCallback } from 'react';
import { ChevronLeftIcon } from '@/shared/ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';

export interface RecordImageSliderProps {
  urls: string[] /** 이미지 URL 목록 */;
  alt: string /** 대체 텍스트 (접근성) */;
  className?: string /** 컨테이너 추가 클래스 (비율 등) */;
}

/**
 * 기록 상세 등에서 여러 이미지를 슬라이드로 보여주는 컴포넌트
 */
export function RecordImageSlider({
  urls,
  alt,
  className = '',
}: RecordImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = urls.length;

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? count - 1 : i - 1));
  }, [count]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= count - 1 ? 0 : i + 1));
  }, [count]);

  if (urls.length === 0) return null;

  const singleImage = count === 1;

  return (
    <div
      className={`relative w-full h-[300px] min-h-0 rounded-xl bg-gray-100 ${className}`}
      role="region"
      aria-label={`${alt} 이미지 ${count}장`}
    >
      {urls.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
          aria-hidden={index !== currentIndex}
        >
          <img
            src={src}
            alt={count > 1 ? `${alt} (${index + 1}/${count})` : alt}
            className="max-w-full max-h-full object-cover"
          />
        </div>
      ))}

      {!singleImage && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="이전 이미지"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="다음 이미지"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium"
            aria-live="polite"
          >
            {currentIndex + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}
