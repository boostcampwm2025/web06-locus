import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapViewportProps } from '@features/home/types/mapViewport';
import type { PinMarkerData } from '@/shared/types/marker';
import { PinOverlay } from '@/infra/map/marker';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import { ROUTES } from '@/router/routes';
import { useMapInstance } from '@/shared/hooks/useMapInstance';

// TODO: 지도 SDK 연동 시 제거할 mock 데이터
const MOCK_PINS: PinMarkerData[] = [
  {
    id: 2,
    position: { lat: 37.5796, lng: 126.977 },
    variant: 'record',
  },
  {
    id: 3,
    position: { lat: 37.5512, lng: 126.9882 },
    variant: 'record',
  },
];

// TODO: 지도 SDK 연동 시 API에서 가져올 위치 정보
const LOCATION_MAP: Record<string | number, { name: string; address: string }> =
  {
    1: {
      name: '경복궁',
      address: '서울시 종로구 사직로 161',
    },
    2: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    3: {
      name: '남산타워',
      address: '서울특별시 용산구 남산공원길 105',
    },
  };

export default function MapViewport({ className = '' }: MapViewportProps) {
  const navigate = useNavigate();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | number | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);

  // 지도 인스턴스 관리
  const {
    mapContainerRef,
    mapInstanceRef,
    isMapLoaded,
    mapLoadError,
    latitude,
    longitude,
  } = useMapInstance({
    useGeolocation: true,
    zoom: 13,
    zoomControl: true,
    zoomControlOptions: {
      position: 1, // naver.maps.Position.TOP_RIGHT
    },
    autoCenterToGeolocation: true,
  });

  const handlePinClick = (pinId: string | number) => {
    const location = LOCATION_MAP[pinId];
    const pin = MOCK_PINS.find((p) => p.id === pinId);
    // 모든 mock 핀은 LOCATION_MAP에 있으므로 항상 존재함
    setSelectedPinId(pinId);
    setSelectedLocation({
      ...location,
      coordinates: pin?.position,
    });
    setIsBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedPinId(null);
    setSelectedLocation(null);
  };

  const handleConfirmRecord = () => {
    if (!selectedLocation) return;

    setIsBottomSheetOpen(false);

    // locationId가 있으면 쿼리에 넣고, state로도 전달 (북마크/새로고침 대비)
    // locationId가 없으면 state만 사용 (즉시 사용 가능, 새로고침 대비)
    if (selectedPinId) {
      // locationId를 쿼리로 전달
      void navigate(`${ROUTES.RECORD}?locationId=${selectedPinId}`, {
        state: {
          location: selectedLocation,
        },
      });
    } else {
      // locationId가 없으면 state만 사용
      void navigate(ROUTES.RECORD, {
        state: {
          location: selectedLocation,
        },
      });
    }
  };

  return (
    <>
      <div
        className={`relative flex-1 bg-gray-100 ${className || ''}`}
        aria-label="지도 영역"
      >
        {/* 지도 컨테이너 - 항상 렌더링 (ref를 위해 필요) */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* 로딩/에러 오버레이 */}
        {mapLoadError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-red-500">{mapLoadError}</p>
          </div>
        ) : !isMapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-400">지도를 불러오는 중...</p>
          </div>
        ) : null}

        {/* 현재 위치 파란 핀 */}
        {isMapLoaded &&
          mapInstanceRef.current &&
          latitude !== null &&
          longitude !== null && (
            <PinOverlay
              key="current-location"
              map={mapInstanceRef.current}
              pin={{
                id: 'current-location',
                position: { lat: latitude, lng: longitude },
                variant: 'current',
              }}
              isSelected={false}
            />
          )}

        {/* 지도에 고정된 핀 마커들 */}
        {isMapLoaded &&
          mapInstanceRef.current &&
          MOCK_PINS.map((pin) => (
            <PinOverlay
              key={pin.id}
              map={mapInstanceRef.current!}
              pin={pin}
              isSelected={selectedPinId === pin.id}
              onClick={handlePinClick}
            />
          ))}

        {/* Floating Action Button */}
        <button
          type="button"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 z-10"
          aria-label="연결 모드"
        >
          연결 모드
        </button>
      </div>
      {selectedLocation && (
        <RecordCreateBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={handleCloseBottomSheet}
          locationName={selectedLocation.name}
          address={selectedLocation.address}
          onConfirm={handleConfirmRecord}
        />
      )}
    </>
  );
}
