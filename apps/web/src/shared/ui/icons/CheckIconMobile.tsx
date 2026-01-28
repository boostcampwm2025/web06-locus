import type { IconProps } from '../../types';

/**
 * 모바일 설정용 체크 아이콘
 */
export function CheckIconMobile({ className, ...props }: IconProps) {
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
        d="M3.33331 8.33331L6.66665 11.6666L13.3333 4.99997"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
