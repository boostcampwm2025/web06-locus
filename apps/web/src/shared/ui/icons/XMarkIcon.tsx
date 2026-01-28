import type { IconProps } from '../../types';

/**
 * 모바일 설정용 X 마크 아이콘
 */
export function XMarkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 10 10"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M1 1L8.32939 8.32939M8.32939 1L1 8.32939"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
