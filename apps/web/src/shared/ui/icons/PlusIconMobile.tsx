import type { IconProps } from '../../types';

/**
 * 모바일 설정용 플러스 아이콘
 */
export function PlusIconMobile({ className, ...props }: IconProps) {
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
        d="M0.999577 0.999577H14.9937M7.99662 0.999577V14.9937"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
