import type { IconProps } from '../../types';

export function IPhoneShareIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 위로 향하는 화살표 */}
      <path d="M12 3v13" />
      <path d="m8 7 4-4 4 4" />
      {/* 아래쪽 사각형 바구니 */}
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
    </svg>
  );
}
