import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { ToastErrorMessage } from '@/shared/ui/alert';
import { AuthPageHeader } from '@/shared/ui/header';
import { useEmailVerify } from '../hooks/useEmailVerify';

export default function EmailVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData =
    (location.state as {
      email?: string;
      password?: string;
      nickname?: string;
    }) || {};
  const email = signupData.email ?? '';

  const {
    code,
    error,
    isLoading,
    isResending,
    resendTimer,
    inputRefs,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResend,
  } = useEmailVerify({
    email,
    password: signupData.password,
    nickname: signupData.nickname,
  });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <AuthPageHeader
          title="이메일 인증"
          subtitle={
            email
              ? `${email}으로 인증 코드를 전송했어요`
              : '이메일로 전송된 인증 코드를 입력해주세요'
          }
        />

        {/* 인증 코드 입력 폼 */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-900 text-center">
              인증 코드 6자리를 입력해주세요
            </p>

            {/* 6개의 개별 입력 필드 */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  aria-label={`인증 코드 ${index + 1}번째 자리`}
                />
              ))}
            </div>
          </div>

          {error && <ToastErrorMessage message={error} variant="error" />}

          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className={`w-full px-4 py-3 rounded-lg transition-colors font-extralight disabled:cursor-not-allowed ${
              code.join('').length === 6
                ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {isLoading ? '인증 중...' : '인증하기'}
          </button>

          {/* 재전송 링크 */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                void handleResend();
              }}
              disabled={
                isResending || !email || !signupData.password || resendTimer > 0
              }
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              코드를 다시 받으시겠어요?
              {resendTimer > 0 && ` (${resendTimer}초)`}
            </button>
          </div>

          {/* 다른 이메일로 시도하기 */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                void navigate(ROUTES.EMAIL_SIGNUP);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              다른 이메일로 시도하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
