import type { IconProps } from '../../types';

/**
 * 모바일 설정용 오른쪽 화살표 아이콘
 */
export function ChevronRightIconMobile({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M1.49937 1.49937L7.49685 7.49685L1.49937 13.4943"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
