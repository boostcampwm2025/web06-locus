import type { IconProps } from '../../types';

/**
 * 경고 원 아이콘
 */
export function WarningCircleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 28 28"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M13.9997 2.33314C20.4431 2.33314 25.6664 7.55648 25.6664 13.9998C25.6664 20.4431 20.4431 25.6665 13.9997 25.6665C7.55639 25.6665 2.33306 20.4431 2.33306 13.9998C2.33306 7.55648 7.55639 2.33314 13.9997 2.33314Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
      <path
        d="M13.9997 9.33314V13.9998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
      <path
        d="M13.9997 18.6662H14.0114"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
    </svg>
  );
}
