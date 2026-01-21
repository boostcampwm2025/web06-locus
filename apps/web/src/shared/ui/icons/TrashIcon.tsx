import type { IconProps } from '../../types';

export function TrashIcon({ className, ...props }: IconProps) {
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
      <g clipPath="url(#clip0_35_2614)">
        <path
          d="M6.66309 7.32959V11.3275"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.32837 7.32959V11.3275"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.66 3.9978V13.3263C12.66 13.6797 12.5196 14.0187 12.2697 14.2686C12.0198 14.5185 11.6808 14.6589 11.3274 14.6589H4.66418C4.31074 14.6589 3.97178 14.5185 3.72186 14.2686C3.47195 14.0187 3.33154 13.6797 3.33154 13.3263V3.9978"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.99902 3.9978H13.9928"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.33057 3.9978V2.66516C5.33057 2.31172 5.47097 1.97276 5.72089 1.72284C5.97081 1.47292 6.30977 1.33252 6.66321 1.33252H9.32849C9.68192 1.33252 10.0209 1.47292 10.2708 1.72284C10.5207 1.97276 10.6611 2.31172 10.6611 2.66516V3.9978"
          stroke="currentColor"
          strokeWidth="1.33264"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_35_2614">
          <rect width="15.9917" height="15.9917" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
