const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

/**
 * 온보딩 완료 여부를 저장합니다.
 */
export const setOnboardingCompleted = (): void => {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
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
};
