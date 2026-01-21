import { useState, useEffect } from 'react';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_STORAGE_EVENT = 'onboarding_storage_changed';

/**
 * 온보딩 완료 여부를 저장합니다.
 */
export const setOnboardingCompleted = (): void => {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  // 커스텀 이벤트 발행 (같은 탭에서도 구독 가능)
  window.dispatchEvent(
    new CustomEvent(ONBOARDING_STORAGE_EVENT, { detail: true }),
  );
};

/**
 * 온보딩 완료 여부를 확인합니다.
 */
export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
};

/**
 * 온보딩 완료 여부를 초기화합니다.
 */
export const clearOnboardingCompleted = (): void => {
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  // 커스텀 이벤트 발행
  window.dispatchEvent(
    new CustomEvent(ONBOARDING_STORAGE_EVENT, { detail: false }),
  );
};

/**
 * 온보딩 완료 상태를 구독하는 커스텀 훅
 * localStorage 변경을 실시간으로 반영합니다.
 */
export const useOnboardingCompleted = (): boolean => {
  const [isCompleted, setIsCompleted] = useState(() => isOnboardingCompleted());

  useEffect(() => {
    const handleStorageChange = (event: CustomEvent<boolean>) => {
      setIsCompleted(event.detail);
    };

    // 커스텀 이벤트 구독
    window.addEventListener(
      ONBOARDING_STORAGE_EVENT,
      handleStorageChange as EventListener,
    );

    // storage 이벤트 구독 (다른 탭에서 변경된 경우)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === ONBOARDING_COMPLETED_KEY) {
        setIsCompleted(isOnboardingCompleted());
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(
        ONBOARDING_STORAGE_EVENT,
        handleStorageChange as EventListener,
      );
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return isCompleted;
};
