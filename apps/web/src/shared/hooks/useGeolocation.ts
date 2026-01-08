import { useState, useEffect } from 'react';
import type { GeolocationState } from '@/shared/types';

const initialState: GeolocationState = {
  latitude: null,
  longitude: null,
  error: null,
  isLoading: true,
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(initialState);

  useEffect(() => {
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
        maximumAge: 0,
      },
    );
  }, []);

  return state;
}
