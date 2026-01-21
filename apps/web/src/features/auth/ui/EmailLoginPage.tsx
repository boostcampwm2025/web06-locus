import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { login, AuthError } from '@/infra/api/services/authService';
import { useAuthStore } from '../domain/authStore';
import { FormInputField } from '@/shared/ui/form';
import { SocialLoginButton } from '@/shared/ui/button';
import { ToastErrorMessage } from '@/shared/ui/alert';
import { AuthPageHeader } from '@/shared/ui/header';
import { isOnboardingCompleted } from '@/infra/storage/onboardingStorage';

export default function EmailLoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({ email, password });

      // localStorage에는 accessToken만 저장 (refreshToken은 쿠키에만 저장)
      void setTokens(response.data.accessToken, '');

      // 온보딩 완료 여부 확인
      // accessToken 발급 시점이므로 신규 가입자로 간주하고 온보딩으로 이동
      const onboardingCompleted = isOnboardingCompleted();

      // 상태 업데이트가 완료된 후 navigate 실행
      setTimeout(() => {
        if (!onboardingCompleted) {
          void navigate(ROUTES.ONBOARDING, { replace: true });
        } else {
          void navigate(ROUTES.HOME, { replace: true });
        }
      }, 0);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('로그인 정보를 다시 확인해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <AuthPageHeader
          title="로그인"
          subtitle="기억을 장소로 기록하고, 연결하다"
        />

        {/* 이메일/비밀번호 로그인 폼 */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormInputField
            label="이메일"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="이메일을 입력해주세요."
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
            <FormInputField
              id="password"
              label=""
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="비밀번호를 입력해주세요."
              required
              labelClassName="hidden"
            />
          </div>

          {error && <ToastErrorMessage message={error} variant="error" />}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-extralight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <Separator />

        {/* 소셜 로그인 버튼 */}
        <SocialLoginButton
          onClick={() => {
            void navigate(ROUTES.LOGIN);
          }}
        />

        {/* 회원가입 링크 */}
        <div className="text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={() => {
              void navigate(ROUTES.EMAIL_SIGNUP);
            }}
            className="text-gray-900 font-normal hover:underline"
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="relative flex items-center py-3 sm:py-4">
      <div className="grow border-t border-gray-300"></div>
      <span className="shrink mx-3 sm:mx-4 text-xs sm:text-sm text-gray-500 bg-white">
        또는
      </span>
      <div className="grow border-t border-gray-300"></div>
    </div>
  );
}
