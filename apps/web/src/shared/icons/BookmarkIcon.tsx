import type { IconProps } from '../types';

export default function BookmarkIcon({ className, ...props }: IconProps) {
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
        d="M18.992 20.9911L11.9949 16.9928L4.99789 20.9911V4.99787C4.99789 4.46766 5.20852 3.95917 5.58343 3.58426C5.95835 3.20934 6.46684 2.99872 6.99705 2.99872H16.9928C17.523 2.99872 18.0315 3.20934 18.4064 3.58426C18.7813 3.95917 18.992 4.46766 18.992 4.99787V20.9911Z"
        stroke="currentColor"
        strokeWidth="1.99915"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
