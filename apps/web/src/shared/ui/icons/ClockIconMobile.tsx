import type { IconProps } from '../../types';

/**
 * 모바일 설정용 시계 아이콘 (원 + 시침/분침)
 */
export function ClockIconMobile({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 20 20"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M9.99577 18.3256C14.5962 18.3256 18.3256 14.5962 18.3256 9.99578C18.3256 5.39535 14.5962 1.66597 9.99577 1.66597C5.39534 1.66597 1.66596 5.39535 1.66596 9.99578C1.66596 14.5962 5.39534 18.3256 9.99577 18.3256Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.99577 4.99789V9.99577L13.3277 11.6617"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
