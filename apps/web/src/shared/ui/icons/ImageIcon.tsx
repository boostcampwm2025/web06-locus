import type { IconProps } from '../../types';

export function ImageIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.8267 2.49902H4.1649C3.24481 2.49902 2.49893 3.24491 2.49893 4.16499V15.8268C2.49893 16.7468 3.24481 17.4927 4.1649 17.4927H15.8267C16.7467 17.4927 17.4926 16.7468 17.4926 15.8268V4.16499C17.4926 3.24491 16.7467 2.49902 15.8267 2.49902Z"
        stroke="currentColor"
        strokeWidth="1.66597"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49683 9.16298C8.41692 9.16298 9.1628 8.4171 9.1628 7.49702C9.1628 6.57693 8.41692 5.83105 7.49683 5.83105C6.57674 5.83105 5.83087 6.57693 5.83087 7.49702C5.83087 8.4171 6.57674 9.16298 7.49683 9.16298Z"
        stroke="currentColor"
        strokeWidth="1.66597"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4926 12.4949L14.922 9.9243C14.6097 9.61197 14.1859 9.43652 13.7442 9.43652C13.3025 9.43652 12.8788 9.61197 12.5664 9.9243L4.99789 17.4928"
        stroke="currentColor"
        strokeWidth="1.66597"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
