import type { IconProps } from '../../types';

/**
 * 아래쪽 화살표 아이콘
 */
export function ChevronDownIcon({ className, ...props }: IconProps) {
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
        d="M3.99831 5.99746L7.99662 9.99577L11.9949 5.99746"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
