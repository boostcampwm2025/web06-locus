import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { requestSignup, AuthError } from '@/infra/api/services/authService';
import { FormInputField } from '@/shared/ui/form';
import { ToastErrorMessage } from '@/shared/ui/alert';
import { AuthPageHeader } from '@/shared/ui/header';

export default function EmailSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await requestSignup({ email, password, nickname });
      // 회원가입 성공 후 이메일 인증 페이지로 이동
      void navigate(ROUTES.EMAIL_VERIFY, {
        state: { email, password, nickname },
      });
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('회원가입 정보를 다시 확인해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <AuthPageHeader
          title="계정 만들기"
          subtitle="기억을 저장하려면 계정이 필요해요"
        />

        {/* 회원가입 폼 */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <FormInputField
            label="이메일"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="이메일을 입력해주세요"
            required
          />

          <FormInputField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="비밀번호를 입력해주세요"
            required
            minLength={8}
          />

          <FormInputField
            label={
              <>
                닉네임 <span className="text-gray-400">(선택)</span>
              </>
            }
            type="text"
            value={nickname}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNickname(e.target.value)
            }
            placeholder="어떻게 불러드릴까요?"
          />

          {error && <ToastErrorMessage message={error} variant="error" />}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-extralight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '계정 생성 중...' : '계정 생성'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center text-sm text-gray-600">
          이미 계정이 있나요?{' '}
          <button
            type="button"
            onClick={() => {
              void navigate(ROUTES.EMAIL_LOGIN);
            }}
            className="text-gray-900 font-medium hover:underline"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
