import type { IconProps } from '../types';

export default function PinMarkerPendingIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="79"
      viewBox="0 0 56 79"
      fill="none"
      aria-hidden="true"
    >
      <path
        opacity="0.2"
        d="M28 75.5985C32.6391 75.5985 36.3998 74.3449 36.3998 72.7985C36.3998 71.2521 32.6391 69.9986 28 69.9986C23.3609 69.9986 19.6002 71.2521 19.6002 72.7985C19.6002 74.3449 23.3609 75.5985 28 75.5985Z"
        fill="black"
      />
      <path
        d="M28 44.7991V69.9986"
        stroke="#3B82F6"
        strokeWidth="3.49993"
        strokeLinecap="round"
      />
      <path
        d="M28 5.59988C39.1998 5.59988 44.7997 13.9997 44.7997 25.1995C44.7997 36.3993 28 44.7991 28 44.7991C28 44.7991 11.2003 36.3993 11.2003 25.1995C11.2003 13.9997 16.8002 5.59988 28 5.59988Z"
        fill="#60A5FA"
        stroke="#2563EB"
        strokeWidth="2.79994"
      />
      <path
        opacity="0.9"
        d="M28 30.7994C32.6391 30.7994 36.3998 27.0386 36.3998 22.3995C36.3998 17.7604 32.6391 13.9997 28 13.9997C23.3609 13.9997 19.6002 17.7604 19.6002 22.3995C19.6002 27.0386 23.3609 30.7994 28 30.7994Z"
        fill="white"
      />
      {/* + 표시를 그룹으로 묶기 */}
      <g className="pin-plus-icon" transform-origin="28 22.3995">
        {/* 중앙 점 */}
        <path
          d="M28 26.5995C30.3195 26.5995 32.1999 24.7191 32.1999 22.3995C32.1999 20.08 30.3195 18.1996 28 18.1996C25.6804 18.1996 23.8001 20.08 23.8001 22.3995C23.8001 24.7191 25.6804 26.5995 28 26.5995Z"
          fill="#2563EB"
        />
        {/* 세로선 위 */}
        <path
          d="M28 13.9997V18.1996"
          stroke="#2563EB"
          strokeWidth="2.79994"
          strokeLinecap="round"
        />
        {/* 세로선 아래 */}
        <path
          d="M28 26.5995V30.7994"
          stroke="#2563EB"
          strokeWidth="2.79994"
          strokeLinecap="round"
        />
        {/* 가로선 왼쪽 */}
        <path
          d="M19.6002 22.3995H23.8001"
          stroke="#2563EB"
          strokeWidth="2.79994"
          strokeLinecap="round"
        />
        {/* 가로선 오른쪽 */}
        <path
          d="M32.1999 22.3995H36.3998"
          stroke="#2563EB"
          strokeWidth="2.79994"
          strokeLinecap="round"
        />
      </g>
      <path
        opacity="0.3"
        d="M22.4001 18.1996C25.4928 18.1996 28 16.3193 28 13.9997C28 11.6802 25.4928 9.7998 22.4001 9.7998C19.3074 9.7998 16.8002 11.6802 16.8002 13.9997C16.8002 16.3193 19.3074 18.1996 22.4001 18.1996Z"
        fill="white"
      />
    </svg>
  );
}
