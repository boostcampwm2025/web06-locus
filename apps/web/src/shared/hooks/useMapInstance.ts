import { useState, useEffect, useRef } from 'react';
import { loadNaverMapScript } from '@/infra/map/naverMapLoader';
import { useGeolocation } from './useGeolocation';
import { initializePinOverlayViewClass } from '@/infra/map/marker/PinOverlayView';
import { useAuthStore } from '@/features/auth/domain/authStore';
import type { UseMapInstanceOptions } from '@/shared/types';

const DEFAULT_CENTER_LAT = 37.5665;
const DEFAULT_CENTER_LNG = 126.978;

export function useMapInstance(options: UseMapInstanceOptions = {}) {
  const {
    initialCoordinates,
    useGeolocation: shouldUseGeolocation = false,
    zoom = 13,
    zoomControl = true,
    zoomControlOptions,
    defaultCenter,
    onMapReady,
    autoCenterToGeolocation = false,
  } = options;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  // autoCenterToGeolocation이 이미 실행되었는지 추적
  const hasAutoCenteredRef = useRef(false);

  // 로그인 체크가 완료된 후에만 위치 권한 요청
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const geolocationEnabled = shouldUseGeolocation && isInitialized;
  const geolocation = useGeolocation(geolocationEnabled);
  const latitude = shouldUseGeolocation ? geolocation.latitude : null;
  const longitude = shouldUseGeolocation ? geolocation.longitude : null;

  /**
   * 컨테이너의 크기가 0보다 커질 때까지 requestAnimationFrame으로 대기합니다.
   */
  const waitForContainerSize = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const check = () => {
        const container = mapContainerRef.current;
        if (!container || mapInstanceRef.current) {
          return resolve(false);
        }

        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          resolve(true);
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  };

  /**
   * 지도 크기 업데이트 수행 (타입 안정성 보장)
   * updateSize는 SDK 런타임에 존재하나 @types/navermaps에 없을 수 있어 별도 타입으로 접근
   */
  type MapWithUpdateSize = naver.maps.Map & { updateSize?: () => void };

  const updateMapSize = (map: naver.maps.Map) => {
    const container = mapContainerRef.current;
    if (
      !container ||
      container.offsetWidth === 0 ||
      container.offsetHeight === 0
    )
      return;

    try {
      const m = map as MapWithUpdateSize;
      if (typeof m.updateSize === 'function') {
        m.updateSize();
      } else {
        window.dispatchEvent(new Event('resize'));
      }
    } catch {
      window.dispatchEvent(new Event('resize'));
    }
  };

  // 지도는 한 번만 초기화되도록 보장 (의존성 배열 최소화)
  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;

    if (!clientId) {
      setMapLoadError('Naver Maps API CLIENT_ID가 설정되지 않았습니다.');
      return;
    }

    // 이미 지도가 초기화되었으면 재초기화하지 않음
    if (mapInstanceRef.current) {
      return;
    }

    // 컨테이너가 없으면 초기화하지 않음
    if (!mapContainerRef.current) {
      return;
    }

    const getCenterCoordinates = () => {
      if (initialCoordinates) {
        return initialCoordinates;
      }
      // 초기화 시점에 위치 정보가 있으면 사용, 없으면 기본값
      if (latitude !== null && longitude !== null) {
        return { lat: latitude, lng: longitude };
      }
      if (defaultCenter) {
        return defaultCenter;
      }
      return { lat: DEFAULT_CENTER_LAT, lng: DEFAULT_CENTER_LNG };
    };

    const initializeMap = async () => {
      try {
        await loadNaverMapScript({ clientId });

        const naverMaps = window.naver?.maps;
        if (!naverMaps || !mapContainerRef.current) {
          setMapLoadError('지도 초기화에 실패했습니다.');
          return;
        }

        // 컨테이너 크기가 유효할 때까지 대기
        const isSizeReady = await waitForContainerSize();
        if (!isSizeReady) return;

        const centerCoords = getCenterCoordinates();
        const center = new naverMaps.LatLng(centerCoords.lat, centerCoords.lng);

        // 지도 인스턴스 생성
        const mapOptions: naver.maps.MapOptions = {
          center,
          zoom,
          zoomControl,
        };

        if (zoomControlOptions) {
          // 지도 로드 후에 Position enum 사용 가능
          mapOptions.zoomControlOptions = {
            ...zoomControlOptions,
            position:
              zoomControlOptions.position ?? naverMaps.Position.TOP_RIGHT,
          };
        }

        const map = new naverMaps.Map(mapContainerRef.current, mapOptions);

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
        setMapLoadError(null);

        // 지도 생성 직후 크기 업데이트
        setTimeout(() => {
          if (mapInstanceRef.current) {
            updateMapSize(mapInstanceRef.current);
          }
        }, 100);

        try {
          // 지도가 로드된 확실한 시점에서 PinOverlayView 클래스 초기화
          initializePinOverlayViewClass();
        } catch (error) {
          console.error('PinOverlayView 클래스 초기화 실패:', error);
        }

        // 지도 로드 후 콜백 실행
        onMapReady?.(map);
      } catch (error) {
        setMapLoadError(
          error instanceof Error ? error.message : '지도 로드 실패',
        );
        setIsMapLoaded(false);
      }
    };

    // 컨테이너 크기 체크 후 초기화 진행
    void waitForContainerSize().then((isReady) => {
      if (isReady) void initializeMap();
    });

    // 컴포넌트 언마운트 시 지도 인스턴스 정리
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 한 번만 실행

  // 현재 위치로 자동 중심 이동 (초기 로드 시에만 실행)
  useEffect(() => {
    if (
      autoCenterToGeolocation &&
      !hasAutoCenteredRef.current &&
      isMapLoaded &&
      mapInstanceRef.current &&
      latitude !== null &&
      longitude !== null
    ) {
      const naverMaps = window.naver?.maps;
      if (naverMaps) {
        const currentPosition = new naverMaps.LatLng(latitude, longitude);
        mapInstanceRef.current.setCenter(currentPosition);
        hasAutoCenteredRef.current = true; // 한 번만 실행되도록 표시
      }
    }
  }, [isMapLoaded, latitude, longitude, autoCenterToGeolocation]);

  // 컨테이너 크기 변화 감지 및 지도 크기 업데이트
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !mapContainerRef.current) {
      return;
    }

    const container = mapContainerRef.current;

    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        updateMapSize(mapInstanceRef.current);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMapLoaded]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  return {
    mapContainerRef,
    mapInstanceRef,
    isMapLoaded,
    mapLoadError,
    handleZoomIn,
    handleZoomOut,
    latitude: shouldUseGeolocation ? latitude : null,
    longitude: shouldUseGeolocation ? longitude : null,
  };
}
