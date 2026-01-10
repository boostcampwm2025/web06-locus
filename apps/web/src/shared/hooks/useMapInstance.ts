import { useState, useEffect, useRef } from 'react';
import { loadNaverMapScript } from '@/infra/map/naverMapLoader';
import { useGeolocation } from './useGeolocation';
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

  const geolocation = useGeolocation();
  const latitude = shouldUseGeolocation ? geolocation.latitude : null;
  const longitude = shouldUseGeolocation ? geolocation.longitude : null;

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

        // 지도 로드 후 콜백 실행
        onMapReady?.(map);
      } catch (error) {
        setMapLoadError(
          error instanceof Error ? error.message : '지도 로드 실패',
        );
        setIsMapLoaded(false);
      }
    };

    void initializeMap();

    // 컴포넌트 언마운트 시 지도 인스턴스 정리
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
    // 지도는 한 번만 초기화되도록 보장
    // zoomControlOptions, onMapReady 등 객체/함수는 매 렌더링마다 새로운 참조가 생성되므로 의존성에서 제외
    // initialCoordinates, zoom, zoomControl, defaultCenter도 초기값만 사용하고 이후 변경은 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 한 번만 실행

  // 현재 위치로 자동 중심 이동
  useEffect(() => {
    if (
      autoCenterToGeolocation &&
      isMapLoaded &&
      mapInstanceRef.current &&
      latitude !== null &&
      longitude !== null
    ) {
      const naverMaps = window.naver?.maps;
      if (naverMaps) {
        const currentPosition = new naverMaps.LatLng(latitude, longitude);
        mapInstanceRef.current.setCenter(currentPosition);
      }
    }
  }, [isMapLoaded, latitude, longitude, autoCenterToGeolocation]);

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
