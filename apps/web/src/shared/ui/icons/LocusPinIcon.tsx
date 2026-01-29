import type { IconProps } from '../../types';

/**
 * PWA 설치 가이드 등에서 사용하는 Locus 브랜드 핀 아이콘 (작은 뱃지용)
 */
export function LocusPinIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.39907 16.0038H10.9954C13.1163 16.0038 15.1502 15.1613 16.6499 13.6616C18.1496 12.162 18.992 10.128 18.992 8.00718V5.00845C18.9943 4.15672 18.7245 3.32652 18.222 2.63884C17.7194 1.95116 17.0104 1.44192 16.1983 1.18533C15.3861 0.928736 14.5132 0.938204 13.7068 1.21235C12.9004 1.4865 12.2026 2.011 11.7151 2.70942L0.999663 18.0029"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
