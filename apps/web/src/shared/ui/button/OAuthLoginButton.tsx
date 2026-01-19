import { GoogleIcon, NaverIcon, KakaoIcon } from '@/shared/icons/Icons';
import type { OAuthProvider } from '@/shared/types';

interface OAuthLoginButtonProps {
  provider: OAuthProvider;
  onClick?: () => void;
  className?: string;
}

const providerConfig = {
  google: {
    icon: GoogleIcon,
    text: 'Google로 로그인',
    bgColor: 'bg-[#F3F4F6]',
    textColor: 'text-gray-900',
    hoverBgColor: 'hover:bg-gray-200',
  },
  naver: {
    icon: NaverIcon,
    text: 'Naver로 로그인',
    bgColor: 'bg-[#02C75A]',
    textColor: 'text-white',
    hoverBgColor: 'hover:bg-[#02B350]',
  },
  kakao: {
    icon: KakaoIcon,
    text: 'Kakao로 로그인',
    bgColor: 'bg-[#FEE501]',
    textColor: 'text-[#3C1E1E]',
    hoverBgColor: 'hover:bg-[#FDD835]',
  },
} as const;

export default function OAuthLoginButton({
  provider,
  onClick,
  className = '',
}: OAuthLoginButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={config.text}
      className={`
                w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                ${config.bgColor}
                ${config.textColor}
                ${config.hoverBgColor}
                transition-colors
                font-extralight
                ${className}
            `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{config.text}</span>
    </button>
  );
}
