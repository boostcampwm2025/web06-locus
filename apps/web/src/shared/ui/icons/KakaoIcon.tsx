import type { IconProps } from '../../types';

export function KakaoIcon({ className, ...props }: IconProps) {
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
        d="M9.99563 2.99866C5.57757 2.99866 1.99915 5.90738 1.99915 9.4958C1.99915 11.5749 3.27858 13.4141 5.26771 14.5536L4.53803 17.3024C4.48805 17.4823 4.66797 17.6322 4.8279 17.5423L8.08647 15.6531C8.70619 15.763 9.34591 15.823 9.99563 15.823C14.4137 15.823 17.9921 12.9143 17.9921 9.32587C17.9921 5.73745 14.4137 2.99866 9.99563 2.99866Z"
        fill="#3C1E1E"
      />
    </svg>
  );
}
