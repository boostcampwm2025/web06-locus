import type { IconProps } from '../types/icon';

export default function TagIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_22_338)">
        <path
          d="M8.3863 1.72311C8.13644 1.47317 7.79754 1.33272 7.44413 1.33264H2.66528C2.31184 1.33264 1.97288 1.47304 1.72296 1.72296C1.47304 1.97288 1.33264 2.31184 1.33264 2.66528V7.44413C1.33272 7.79754 1.47317 8.13644 1.72311 8.3863L7.52275 14.186C7.8256 14.4869 8.23521 14.6558 8.66216 14.6558C9.08911 14.6558 9.49872 14.4869 9.80157 14.186L14.186 9.80157C14.4869 9.49872 14.6558 9.08911 14.6558 8.66216C14.6558 8.23521 14.4869 7.8256 14.186 7.52275L8.3863 1.72311Z"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.99741 5.33057C5.1814 5.33057 5.33057 5.1814 5.33057 4.99741C5.33057 4.81341 5.1814 4.66425 4.99741 4.66425C4.81341 4.66425 4.66425 4.81341 4.66425 4.99741C4.66425 5.1814 4.81341 5.33057 4.99741 5.33057Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_22_338">
          <rect width="15.9917" height="15.9917" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
