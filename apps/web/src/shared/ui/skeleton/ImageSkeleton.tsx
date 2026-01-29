import { motion } from 'motion/react';

export interface ImageSkeletonProps {
  className?: string;
}

/**
 * 이미지 로딩 중 스켈레톤 컴포넌트
 * 옅은 그라데이션이 좌우로 이동하는 애니메이션을 제공합니다.
 */
export function ImageSkeleton({ className = '' }: ImageSkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="status"
      aria-label="이미지 로딩 중"
    >
      <div className="absolute inset-0 bg-gray-100" />
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-gray-50/50 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
