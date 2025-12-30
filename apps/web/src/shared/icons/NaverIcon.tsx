import type { IconProps } from '../types';

export default function NaverIcon({ className, ...props }: IconProps) {
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
      <g clipPath="url(#clip0_232_43)">
        <path
          d="M17.9921 0H1.99912C0.895036 0 0 0.895036 0 1.99912V17.9921C0 19.0962 0.895036 19.9912 1.99912 19.9912H17.9921C19.0962 19.9912 19.9912 19.0962 19.9912 17.9921V1.99912C19.9912 0.895036 19.0962 0 17.9921 0Z"
          fill="white"
        />
        <path
          d="M13.5941 10.4954L10.8953 6.49713H8.39636V13.4941H10.3955V9.49581L13.0943 13.4941H15.5932V6.49713H13.5941V10.4954Z"
          fill="#03C75A"
        />
        <path
          d="M6.39719 10.4954L9.096 6.49713H11.5949V13.4941H9.59578V9.49581L6.89697 13.4941H4.39807V6.49713H6.39719V10.4954Z"
          fill="#03C75A"
        />
      </g>
      <defs>
        <clipPath id="clip0_232_43">
          <rect width="19.9912" height="19.9912" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
