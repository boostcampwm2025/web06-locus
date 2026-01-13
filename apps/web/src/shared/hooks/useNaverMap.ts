import { useEffect, useState } from 'react';
import {
  loadNaverMapScript,
  isNaverMapLoaded,
} from '@/infra/map/naverMapLoader';

/**
 * 네이버 지도 SDK 로드 상태를 관리하는 훅
 */
export function useNaverMap() {
  const [isReady, setIsReady] = useState(isNaverMapLoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isReady) {
      return;
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      setError(new Error('Naver Maps API CLIENT_ID가 설정되지 않았습니다.'));
      return;
    }

    loadNaverMapScript({ clientId })
      .then(() => {
        setIsReady(true);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsReady(false);
      });
  }, [isReady]);

  return { isReady, error };
}
