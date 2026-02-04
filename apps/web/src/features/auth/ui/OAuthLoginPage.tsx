import { useNavigate } from 'react-router-dom';
import OAuthLoginButton from '@/shared/ui/button/OAuthLoginButton';
import { handleOAuthLogin } from '../data/oauthLogin';
import { ROUTES } from '@/router/routes';
import { AuthPageHeader } from '@/shared/ui/header';
import { useAuthStore } from '../domain/authStore';

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
  const setTokens = useAuthStore((state) => state.setTokens);

  // 개발 환경에서만 테스트 로그인 (바로 HOME으로 이동)
  const handleTestLogin = () => {
    // 더미 토큰 설정 (실제 API 호출 없이 인증 상태만 설정)
    void setTokens('test-access-token');
    void navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <AuthPageHeader subtitle="기억을 장소로 기록하고, 연결하다" />

        {/* 개발 환경에서만 테스트 로그인 버튼 표시 */}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={handleTestLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors font-normal"
          >
            <span>개발용 로그인</span>
          </button>
        )}

        {/* 이메일로 시작하기 버튼 */}
        <button
          type="button"
          onClick={() => {
            void navigate(ROUTES.EMAIL_LOGIN);
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-normal"
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
