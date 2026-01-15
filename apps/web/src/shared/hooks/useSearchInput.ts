import { useState } from 'react';
import type {
  UseSearchInputOptions,
  UseSearchInputReturn,
} from '@/shared/types/header';

/**
 * 검색 입력 상태 관리 훅
 * Controlled/Uncontrolled 패턴을 모두 지원합니다.
 *
 * @param options - 검색 입력 옵션
 * @returns 검색 입력 핸들러와 값
 */
export function useSearchInput({
  value: externalValue,
  onChange: externalOnChange,
  onCancel,
}: UseSearchInputOptions): UseSearchInputReturn {
  const [localValue, setLocalValue] = useState('');

  const isControlled = externalOnChange !== undefined;
  const displayValue = isControlled ? (externalValue ?? '') : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isControlled) {
      externalOnChange?.(newValue);
    } else {
      setLocalValue(newValue);
    }
  };

  const handleCancel = () => {
    if (isControlled) {
      externalOnChange?.('');
    } else {
      setLocalValue('');
    }
    onCancel?.();
  };

  return {
    value: displayValue,
    onChange: handleChange,
    onCancel: handleCancel,
  };
}
