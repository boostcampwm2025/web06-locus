import type { IconProps } from '../../types';

export function CameraIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_288_698)">
        <path
          d="M22.9902 18.992C22.9902 19.5222 22.7796 20.0306 22.4047 20.4056C22.0297 20.7805 21.5212 20.9911 20.9911 20.9911H2.99872C2.46852 20.9911 1.96002 20.7805 1.58511 20.4056C1.21019 20.0306 0.999573 19.5222 0.999573 18.992V7.99665C0.999573 7.46645 1.21019 6.95796 1.58511 6.58305C1.96002 6.20812 2.46852 5.9975 2.99872 5.9975H6.99702L8.99617 2.99878H14.9936L16.9928 5.9975H20.9911C21.5212 5.9975 22.0297 6.20812 22.4047 6.58305C22.7796 6.95796 22.9902 7.46645 22.9902 7.99665V18.992Z"
          stroke="currentColor"
          strokeWidth="1.99915"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9949 16.9927C14.203 16.9927 15.9932 15.2026 15.9932 12.9944C15.9932 10.7862 14.203 8.99609 11.9949 8.99609C9.78668 8.99609 7.99658 10.7862 7.99658 12.9944C7.99658 15.2026 9.78668 16.9927 11.9949 16.9927Z"
          stroke="currentColor"
          strokeWidth="1.99915"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_288_698">
          <rect width="23.9898" height="23.9898" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
