import { useState } from 'react';
import type { MapViewportProps } from '@features/home/types/mapViewport.types';
import type { PinMarkerData } from '@/shared/types/marker';
import PinMarker from '@/shared/ui/marker/PinMarker';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import RecordWritePage from '@/features/record/ui/RecordWritePage';
import type { Record as RecordType } from '@/features/record/types';

// TODO: 지도 SDK 연동 시 제거할 mock 데이터
const MOCK_PINS: PinMarkerData[] = [
  {
    id: 1,
    position: { lat: 37.5665, lng: 126.978 },
    variant: 'current',
  },
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

// TODO: 지도 SDK 연동 시 제거할 mock 위치 좌표 (픽셀 기준)
const MOCK_PIN_POSITIONS: Record<
  string | number,
  { top: string; left: string }
> = {
  1: { top: '30%', left: '50%' },
  2: { top: '25%', left: '60%' },
  3: { top: '40%', left: '45%' },
};

export default function MapViewport({ className = '' }: MapViewportProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | number | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [isRecordWritePageOpen, setIsRecordWritePageOpen] = useState(false);

  const handlePinClick = (pinId: string | number) => {
    const location = LOCATION_MAP[pinId];
    // 모든 mock 핀은 LOCATION_MAP에 있으므로 항상 존재함
    setSelectedPinId(pinId);
    setSelectedLocation(location);
    setIsBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedPinId(null);
  };

  const handleConfirmRecord = () => {
    setIsBottomSheetOpen(false);
    setIsRecordWritePageOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveRecord = (_record: RecordType) => {
    // TODO: 기록 저장 처리 (mock 데이터로 생성됨)
    setIsRecordWritePageOpen(false);
    setSelectedPinId(null);
    setSelectedLocation(null);
  };

  const handleCancelRecordWrite = () => {
    setIsRecordWritePageOpen(false);
    setSelectedPinId(null);
    setSelectedLocation(null);
  };

  // 기록 작성 페이지가 열려있으면 페이지를 표시
  if (isRecordWritePageOpen && selectedLocation) {
    return (
      <RecordWritePage
        initialLocation={selectedLocation}
        onSave={handleSaveRecord}
        onCancel={handleCancelRecordWrite}
      />
    );
  }

  return (
    <>
      <div
        className={`relative flex-1 bg-gray-100 ${className || ''}`}
        aria-label="지도 영역"
      >
        {/* 지도 영역 - 실제 지도 SDK가 들어갈 공간 */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-green-50 to-yellow-50">
          {/* 지도 배경 시뮬레이션 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-green-200 rounded-full blur-3xl" />
          </div>
        </div>

        {/* TODO: 지도 SDK 연동 시 제거할 mock 핀 마커들 */}
        {MOCK_PINS.map((pin) => {
          const position = MOCK_PIN_POSITIONS[pin.id];
          // 모든 mock 핀은 MOCK_PIN_POSITIONS에 있으므로 항상 존재함

          return (
            <div
              key={pin.id}
              className="absolute z-20"
              style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <PinMarker
                pin={pin}
                isSelected={selectedPinId === pin.id}
                onClick={handlePinClick}
              />
            </div>
          );
        })}

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
