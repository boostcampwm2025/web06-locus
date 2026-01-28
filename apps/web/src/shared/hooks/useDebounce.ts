import { useEffect, useState } from 'react';

/**
 * 디바운스 훅
 * 입력값이 변경된 후 지정된 시간 동안 추가 변경이 없을 때만 값을 업데이트합니다.
 *
 * @param value - 디바운스할 값
 * @param delay - 디바운스 지연 시간 (밀리초)
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // debouncedSearchTerm이 변경될 때만 API 호출
 *   fetchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 시간 후에 값을 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup: 값이 변경되면 이전 타이머를 취소
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
