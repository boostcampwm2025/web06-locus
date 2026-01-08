import { useState, useEffect, useRef } from 'react';
import { loadNaverMapScript } from '@/infra/map/naverMapLoader';
import type { UseNaverMapOptions } from '../../types';

const DEFAULT_CENTER_LAT = 37.5665;
const DEFAULT_CENTER_LNG = 126.978;

export function useRecordMap({
  initialCoordinates,
  zoom = 16,
  zoomControl = false,
  defaultCenter,
}: UseNaverMapOptions = {}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  const centerLat = defaultCenter?.lat ?? DEFAULT_CENTER_LAT;
  const centerLng = defaultCenter?.lng ?? DEFAULT_CENTER_LNG;

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;

    if (!clientId) {
      setMapLoadError('Naver Maps API CLIENT_ID가 설정되지 않았습니다.');
      return;
    }

    const initializeMap = async () => {
      try {
        await loadNaverMapScript({ clientId });

        const naverMaps = window.naver?.maps;
        if (!naverMaps || !mapContainerRef.current) {
          setMapLoadError('지도 초기화에 실패했습니다.');
          return;
        }

        const center = initialCoordinates
          ? new naverMaps.LatLng(initialCoordinates)
          : new naverMaps.LatLng(centerLat, centerLng);

        const map = new naverMaps.Map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl,
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
        setMapLoadError(null);
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
  }, [initialCoordinates, zoom, zoomControl, centerLat, centerLng]);

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
  };
}
