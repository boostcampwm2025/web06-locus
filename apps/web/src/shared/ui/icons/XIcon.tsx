import type { IconProps } from '../../types';

export function XIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.99777 2.99927L2.99927 8.99777M2.99927 2.99927L8.99777 8.99777"
        stroke="currentColor"
        strokeWidth="1.49962"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
