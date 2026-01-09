import type { LoadingPageVersion } from '@/shared/types/loading';

/**
 * 랜덤 로딩 페이지 버전을 반환합니다.
 * @returns 1, 2, 3 중 랜덤한 버전
 */
export const getRandomLoadingVersion = (): LoadingPageVersion => {
  return (Math.floor(Math.random() * 3) + 1) as LoadingPageVersion;
};
