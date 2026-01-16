import type { SocialLoginButtonProps } from '@/shared/types';

export default function SocialLoginButton({
  onClick,
  className = '',
  text = '소셜 계정으로 로그인',
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-orange-500 border-2 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-700 transition-colors font-extralight ${className}`}
    >
      <span>{text}</span>
    </button>
  );
}
