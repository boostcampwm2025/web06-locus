import type { IconProps } from '../../types';

export function LinkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_305_777)">
        <path
          d="M5.24727 9.9116H4.08121C3.30807 9.9116 2.56659 9.60447 2.01989 9.05777C1.47319 8.51107 1.16606 7.76959 1.16606 6.99645C1.16606 6.2233 1.47319 5.48182 2.01989 4.93513C2.56659 4.38843 3.30807 4.0813 4.08121 4.0813H5.24727"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.74545 4.0813H9.91151C10.6847 4.0813 11.4261 4.38843 11.9728 4.93513C12.5195 5.48182 12.8267 6.2233 12.8267 6.99645C12.8267 7.76959 12.5195 8.51107 11.9728 9.05777C11.4261 9.60447 10.6847 9.9116 9.91151 9.9116H8.74545"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.66425 6.99634H9.32849"
          stroke="currentColor"
          strokeWidth="1.16606"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_305_777">
          <rect width="13.9927" height="13.9927" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
