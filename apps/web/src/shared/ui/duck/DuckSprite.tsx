import { useDuckAsset } from '@/shared/hooks/useDuckAsset';

export interface DuckSpriteProps {
  /** 바라보는 방향 각도 (0 = 동, 90 = 남, 180 = 서, 270 = 북) */
  angle: number;
  /** 이미지 크기 (px). 기본 64 */
  size?: number;
  /** 추가 className */
  className?: string;
  /** img alt */
  alt?: string;
}

/**
 * duck-walk 에셋을 각도에 맞는 방향으로 표시하는 오리 스프라이트.
 * 지도 마스코트 등에서 사용.
 */
export function DuckSprite({
  angle,
  size = 64,
  className = '',
  alt = '오리',
}: DuckSpriteProps) {
  const src = useDuckAsset(angle);

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      draggable={false}
      style={{ width: size, height: size }}
    />
  );
}
