import type { IconProps } from '../../types';

/**
 * 모바일 설정용 뒤로가기 아이콘
 */
export function BackArrowIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M6.99704 12.9945L0.999577 6.99704L6.99704 0.999577"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
