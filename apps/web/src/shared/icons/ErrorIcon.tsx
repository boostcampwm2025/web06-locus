import type { IconProps } from '../types';

export default function ErrorIcon({ className, ...props }: IconProps) {
    return (
        <svg
            {...props}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M15.9989 29.3312C23.3621 29.3312 29.3313 23.3621 29.3313 15.9988C29.3313 8.63558 23.3621 2.66647 15.9989 2.66647C8.63561 2.66647 2.6665 8.63558 2.6665 15.9988C2.6665 23.3621 8.63561 29.3312 15.9989 29.3312Z"
                stroke="currentColor"
                strokeWidth="1.99986"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.9988 10.6659V15.9988"
                stroke="currentColor"
                strokeWidth="1.99986"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.9988 21.3318H16.0121"
                stroke="currentColor"
                strokeWidth="1.99986"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
