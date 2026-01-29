import { useState, useEffect } from 'react';

import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  /** 이미지 로드 실패 시 사용할 URL. 미지정 시 기록 기본 이미지 사용 */
  fallbackSrc?: string;
}

/**
 * 이미지 로딩 실패 시 대체 이미지를 보여주는 컴포넌트
 *
 * @example
 * ```tsx
 * <ImageWithFallback
 *   src="https://example.com/image.jpg"
 *   alt="예시 이미지"
 *   className="w-full h-full object-cover"
 * />
 * ```
 */
export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackSrc = RECORD_PLACEHOLDER_IMAGE,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // src가 바뀌면 내부 state를 동기화 (비동기로 나중에 전달되는 URL 대응)
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
