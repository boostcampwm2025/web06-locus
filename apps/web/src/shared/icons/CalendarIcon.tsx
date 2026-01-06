import type { IconProps } from '../types/icon';

export default function CalendarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_35_2567)">
        <path
          d="M4.66431 1.16602V3.49814"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.32837 1.16602V3.49814"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.0775 2.33203H2.91508C2.27109 2.33203 1.74902 2.85409 1.74902 3.49809V11.6605C1.74902 12.3045 2.27109 12.8266 2.91508 12.8266H11.0775C11.7215 12.8266 12.2436 12.3045 12.2436 11.6605V3.49809C12.2436 2.85409 11.7215 2.33203 11.0775 2.33203Z"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.74902 5.83032H12.2436"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_35_2567">
          <rect width="13.9927" height="13.9927" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
