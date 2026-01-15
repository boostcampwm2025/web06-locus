import { useNavigate } from 'react-router-dom';
import Logo from '@/shared/icons/Logo';
import OAuthLoginButton from '@/shared/ui/button/OAuthLoginButton';
import { handleOAuthLogin } from '../data/oauthLogin';
import { ROUTES } from '@/router/routes';

function LoginHeader() {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <Logo className="w-24 h-24 sm:w-[140px] sm:h-[140px]" />
      <p className="text-gray-500 text-xs sm:text-sm px-4 text-center">
        기억을 장소로 기록하고, 연결하다
      </p>
    </div>
  );
}

function OAuthLoginSection() {
  return (
    <div className="relative flex items-center py-3 sm:py-4">
      <div className="grow border-t border-gray-300"></div>
      <span className="shrink mx-3 sm:mx-4 text-xs sm:text-sm text-gray-500 bg-white">
        소셜 계정으로 로그인
      </span>
      <div className="grow border-t border-gray-300"></div>
    </div>
  );
}

export default function OAuthLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <LoginHeader />

        {/* 이메일로 시작하기 버튼 */}
        <button
          type="button"
          onClick={() => {
            void navigate(ROUTES.EMAIL_LOGIN);
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-extralight"
        >
          <span>이메일로 시작하기</span>
        </button>

        <OAuthLoginSection />

        {/* OAuth Login Buttons */}
        <div className="space-y-2.5 sm:space-y-3">
          <OAuthLoginButton
            provider="google"
            onClick={() => {
              handleOAuthLogin('google');
            }}
          />
          <OAuthLoginButton
            provider="naver"
            onClick={() => {
              handleOAuthLogin('naver');
            }}
          />
          <OAuthLoginButton
            provider="kakao"
            onClick={() => {
              handleOAuthLogin('kakao');
            }}
          />
        </div>
      </div>
    </div>
  );
}
