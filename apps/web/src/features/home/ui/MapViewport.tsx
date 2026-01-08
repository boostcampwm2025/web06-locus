import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapViewportProps } from '@features/home/types/mapViewport';
import type { PinMarkerData } from '@/shared/types/marker';
import { PinOverlay } from '@/infra/map/marker';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import { ROUTES } from '@/router/routes';
import { useMapInstance } from '@/shared/hooks/useMapInstance';
import type { Record as RecordType } from '@/features/record/types';

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

// TODO: 지도 SDK 연동 시 API에서 가져올 기록 데이터
const MOCK_RECORDS: Record<string | number, RecordType> = {
  2: {
    id: '2',
    text: '경복궁에서 산책하며 느낀 생각들\n\n자연 속에서 걷다 보면 마음이 편안해진다. 새소리와 바람소리가 귀에 들어오고, 발 아래로 느껴지는 흙의 감촉이 좋다.',
    location: {
      name: '경복궁',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    tags: ['산책', '자연', '휴식'],
    createdAt: new Date('2024-01-15'),
  },
  3: {
    id: '3',
    text: '남산타워에서 본 서울의 야경\n\n도시의 불빛들이 마치 별처럼 반짝인다. 높은 곳에서 내려다보니 일상의 고민들이 작아 보인다.',
    location: {
      name: '남산타워',
      address: '서울특별시 용산구 남산공원길 105',
    },
    tags: ['야경', '도시', '명상'],
    createdAt: new Date('2024-01-20'),
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
  const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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

  // 보라 핀(기록 핀) 클릭 핸들러 - summary 표시
  const handleRecordPinClick = (pinId: string | number) => {
    const record = MOCK_RECORDS[pinId];
    if (record) {
      setSelectedRecord(record);
      setIsSummaryOpen(true);
      setSelectedPinId(pinId);
    }
  };

  // 파란 핀(현재 위치) 클릭 핸들러 - 기록 작성 페이지로 이동
  const handleCurrentLocationClick = () => {
    if (latitude !== null && longitude !== null) {
      void navigate(ROUTES.RECORD, {
        state: {
          location: {
            name: '현재 위치',
            address: '현재 위치',
            coordinates: { lat: latitude, lng: longitude },
          },
        },
      });
    }
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
              onClick={handleCurrentLocationClick}
            />
          )}

        {/* 지도에 고정된 핀 마커들 (기록 핀) */}
        {isMapLoaded &&
          mapInstanceRef.current &&
          MOCK_PINS.map((pin) => (
            <PinOverlay
              key={pin.id}
              map={mapInstanceRef.current!}
              pin={pin}
              isSelected={selectedPinId === pin.id}
              onClick={handleRecordPinClick}
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
      {/* 기록 작성용 Bottom Sheet (현재는 사용 안 함) */}
      {selectedLocation && (
        <RecordCreateBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={handleCloseBottomSheet}
          locationName={selectedLocation.name}
          address={selectedLocation.address}
          onConfirm={handleConfirmRecord}
        />
      )}

      {/* 기록 Summary Bottom Sheet */}
      {selectedRecord && (
        <RecordSummaryBottomSheet
          isOpen={isSummaryOpen}
          onClose={() => {
            setIsSummaryOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
        />
      )}
    </>
  );
}
