import type { IconProps } from '../../types';

export function LogoutIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.3274 14.1605L17.4922 9.99563L13.3274 5.83081"
        stroke="currentColor"
        strokeWidth="1.66593"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4923 9.99561H7.4967"
        stroke="currentColor"
        strokeWidth="1.66593"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49669 17.4923H4.16483C3.723 17.4923 3.29926 17.3167 2.98684 17.0043C2.67442 16.6919 2.4989 16.2682 2.4989 15.8263V4.16483C2.4989 3.723 2.67442 3.29926 2.98684 2.98684C3.29926 2.67442 3.723 2.4989 4.16483 2.4989H7.49669"
        stroke="currentColor"
        strokeWidth="1.66593"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
