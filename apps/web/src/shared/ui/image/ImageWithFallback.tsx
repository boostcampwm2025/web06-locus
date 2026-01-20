import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
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
  fallbackSrc = 'https://placehold.co/400x300',
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

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
