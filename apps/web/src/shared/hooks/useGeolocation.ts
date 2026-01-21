import { useState, useEffect } from 'react';
import type { GeolocationState } from '@/shared/types';

const initialState: GeolocationState = {
  latitude: null,
  longitude: null,
  error: null,
  isLoading: true,
};

export function useGeolocation(enabled = false): GeolocationState {
  const [state, setState] = useState<GeolocationState>(initialState);

  useEffect(() => {
    // enabled가 false이면 위치 권한 요청하지 않음
    if (!enabled) {
      setState({
        ...initialState,
        isLoading: false,
      });
      return;
    }

    // 지원이 안되는 브라우저 처리
    if (!navigator.geolocation) {
      const error: GeolocationPositionError = {
        code: 0,
        message: 'Geolocation이 지원되지 않는 브라우저입니다.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;

      setState({
        ...initialState,
        error,
        isLoading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
        });
      },
      // 권한 거부 처리
      (error: GeolocationPositionError) => {
        setState({
          ...initialState,
          error,
          isLoading: false,
        });
      },
      {
        // GPS 정확도 높임
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5분 (캐시된 위치 정보 사용 허용)
      },
    );
  }, [enabled]);

  return state;
}
