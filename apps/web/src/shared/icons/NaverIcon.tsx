import type { IconProps } from '../types';

export default function NaverIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 6C0 2.68629 2.68629 0 6 0H13.98C17.2937 0 19.98 2.68629 19.98 6V13.98C19.98 17.2937 17.2937 19.98 13.98 19.98H6C2.68629 19.98 0 17.2937 0 13.98V6Z"
        fill="white"
      />
      <path
        d="M14.0861 5.37787V15.5597H12.2267L7.79703 9.15131H7.72246V15.5597H5.56976V5.37787H7.45896L11.8538 11.7813H11.9433V5.37787H14.0861Z"
        fill="#03C75A"
      />
    </svg>
  );
}
