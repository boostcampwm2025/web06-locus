import type { IconProps } from '../../types';

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.9953 18.992C15.4117 18.992 18.992 15.4118 18.992 10.9954C18.992 6.57899 15.4117 2.99878 10.9953 2.99878C6.57893 2.99878 2.99872 6.57899 2.99872 10.9954C2.99872 15.4118 6.57893 18.992 10.9953 18.992Z"
        stroke="currentColor"
        strokeWidth="1.99915"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.9911 20.9912L16.693 16.693"
        stroke="currentColor"
        strokeWidth="1.99915"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
