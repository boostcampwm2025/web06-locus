import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import {
  verifySignup,
  requestSignup,
  AuthError,
} from '@/infra/api/services/authService';
import type { UseEmailVerifyParams } from '../types/auth';

export function useEmailVerify({
  email,
  password,
  nickname = '',
}: UseEmailVerifyParams) {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 재전송 타이머
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // 다음 입력 필드로 자동 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // 백스페이스 시 이전 필드로 이동
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('').filter((char) => /^\d$/.test(char));
    const newCode = [...code];
    digits.forEach((digit, idx) => {
      if (idx < 6) {
        newCode[idx] = digit;
      }
    });
    setCode(newCode);
    // 마지막 입력된 필드로 포커스
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('인증 코드 6자리를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      await verifySignup({ email, code: codeString });
      // 인증 성공 후 로그인 페이지로 이동
      void navigate(ROUTES.EMAIL_LOGIN);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('인증 코드가 올바르지 않습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호 정보가 없습니다.');
      return;
    }

    setError(null);
    setIsResending(true);

    try {
      await requestSignup({
        email,
        password,
        nickname,
      });
      setResendTimer(60); // 60초 타이머 시작
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('인증 코드 재전송에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return {
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
  };
}
