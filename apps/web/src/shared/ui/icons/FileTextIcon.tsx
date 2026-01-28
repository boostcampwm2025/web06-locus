import type { IconProps } from '../../types';

/**
 * 파일 텍스트 아이콘
 */
export function FileTextIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 13H8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17H8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9H8" />
    </svg>
  );
}
