import type { IconProps } from '../types';

export default function RefreshIcon({ className, ...props }: IconProps) {
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
                d="M2.49902 9.99579C2.49902 8.00751 3.28887 6.10066 4.69479 4.69473C6.10072 3.2888 8.00757 2.49896 9.99585 2.49896C12.0917 2.50685 14.1033 3.32463 15.6101 4.78133L17.4927 6.66387"
                stroke="currentColor"
                strokeWidth="1.24947"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M17.4925 2.49896V6.66387H13.3276"
                stroke="currentColor"
                strokeWidth="1.24947"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M17.4927 9.99579C17.4927 11.9841 16.7028 13.8909 15.2969 15.2968C13.891 16.7028 11.9841 17.4926 9.99585 17.4926C7.90003 17.4847 5.8884 16.6669 4.38156 15.2102L2.49902 13.3277"
                stroke="currentColor"
                strokeWidth="1.24947"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6.66393 13.3277H2.49902V17.4926"
                stroke="currentColor"
                strokeWidth="1.24947"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
