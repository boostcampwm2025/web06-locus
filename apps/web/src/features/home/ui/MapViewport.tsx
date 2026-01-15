import { useState, useMemo } from 'react';
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
  {
    id: 4,
    position: { lat: 37.5665, lng: 126.978 },
    variant: 'record',
  },
  {
    id: 5,
    position: { lat: 37.5326, lng: 127.0246 },
    variant: 'record',
  },
  {
    id: 6,
    position: { lat: 37.4979, lng: 127.0276 },
    variant: 'record',
  },
  {
    id: 7,
    position: { lat: 37.5663, lng: 126.9779 },
    variant: 'record',
  },
  {
    id: 8,
    position: { lat: 37.5509, lng: 126.9885 },
    variant: 'record',
  },
  {
    id: 9,
    position: { lat: 37.5704, lng: 126.9918 },
    variant: 'record',
  },
  {
    id: 10,
    position: { lat: 37.5172, lng: 127.0473 },
    variant: 'record',
  },
  {
    id: 11,
    position: { lat: 37.5668, lng: 126.9784 },
    variant: 'record',
  },
  {
    id: 12,
    position: { lat: 37.545, lng: 126.9896 },
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
      address: '서울특별시 종로구 사직로 161',
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
  4: {
    id: '4',
    text: '덕수궁 돌담길을 따라 걷다\n\n역사의 흔적이 남아있는 돌담을 만지며 과거를 상상해본다. 시간이 멈춘 것 같은 이곳에서 평온함을 느낀다.',
    location: {
      name: '덕수궁',
      address: '서울특별시 중구 세종대로 99',
    },
    tags: ['역사', '산책', '평온'],
    createdAt: new Date('2024-01-25'),
  },
  5: {
    id: '5',
    text: '한강공원에서 느낀 자유로움\n\n강바람이 불어오는 이곳에서 모든 걱정을 내려놓는다. 하늘과 강이 만나는 지평선을 보며 마음이 넓어진다.',
    location: {
      name: '반포한강공원',
      address: '서울특별시 서초구 반포동',
    },
    tags: ['한강', '자유', '휴식'],
    createdAt: new Date('2024-02-01'),
  },
  6: {
    id: '6',
    text: '강남역 지하상가에서 발견한 작은 카페\n\n바쁜 일상 속에서도 잠시 멈춰 쉴 수 있는 공간. 커피 한 잔과 함께 내면의 소리에 귀 기울인다.',
    location: {
      name: '강남역',
      address: '서울특별시 강남구 강남대로 396',
    },
    tags: ['카페', '일상', '휴식'],
    createdAt: new Date('2024-02-05'),
  },
  7: {
    id: '7',
    text: '명동 거리를 걷다\n\n사람들의 발걸음과 상점들의 불빛이 어우러진 밤거리. 도시의 생동감 속에서도 나만의 속도를 찾는다.',
    location: {
      name: '명동',
      address: '서울특별시 중구 명동길 26',
    },
    tags: ['도시', '야경', '산책'],
    createdAt: new Date('2024-02-10'),
  },
  8: {
    id: '8',
    text: '남산 한옥마을에서의 오후\n\n전통과 현대가 공존하는 이곳에서 시간의 흐름을 느낀다. 옛것과 새것이 만나는 지점에서 영감을 얻는다.',
    location: {
      name: '남산 한옥마을',
      address: '서울특별시 중구 퇴계로34길 28',
    },
    tags: ['전통', '문화', '영감'],
    createdAt: new Date('2024-02-15'),
  },
  9: {
    id: '9',
    text: '북촌 한옥마을 골목길\n\n좁은 골목 사이로 스며드는 햇살. 이곳을 지나가는 사람들의 이야기가 궁금해진다. 시간이 천천히 흐르는 느낌이다.',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길 37',
    },
    tags: ['한옥', '골목', '평온'],
    createdAt: new Date('2024-02-20'),
  },
  10: {
    id: '10',
    text: '잠실 롯데타워 전망대\n\n도시 전체를 한눈에 내려다보는 순간. 작은 나지만 이 거대한 도시의 일부라는 것을 느낀다.',
    location: {
      name: '롯데월드타워',
      address: '서울특별시 송파구 올림픽로 300',
    },
    tags: ['전망', '도시', '명상'],
    createdAt: new Date('2024-02-25'),
  },
  11: {
    id: '11',
    text: '인사동 골목에서 발견한 작은 서점\n\n책 냄새와 고요함이 어우러진 공간. 종이책을 넘기는 소리가 마음에 평화를 가져다준다.',
    location: {
      name: '인사동',
      address: '서울특별시 종로구 인사동길',
    },
    tags: ['책', '평화', '문화'],
    createdAt: new Date('2024-03-01'),
  },
  12: {
    id: '12',
    text: '이태원 언덕길을 오르며\n\n경사진 길을 오르는 것이 인생과 닮았다. 한 걸음씩 올라가다 보면 어느새 높은 곳에 도달해 있다.',
    location: {
      name: '이태원',
      address: '서울특별시 용산구 이태원로27길 20',
    },
    tags: ['산책', '성장', '명상'],
    createdAt: new Date('2024-03-05'),
  },
};

export default function MapViewport({
  className = '',
  newRecordPin,
}: MapViewportProps) {
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

  // 새로 저장된 기록 핀과 기존 핀 합치기
  const allPins = useMemo<PinMarkerData[]>(() => {
    const pins = [...MOCK_PINS];

    if (newRecordPin?.coordinates) {
      const newPin = {
        id: newRecordPin.record.id,
        position: newRecordPin.coordinates,
        variant: 'record' as const,
      };
      pins.push(newPin);
    }
    return pins;
  }, [newRecordPin]);

  // 새로 저장된 기록도 포함한 전체 기록 데이터
  const allRecords = useMemo<Record<string | number, RecordType>>(() => {
    const records = { ...MOCK_RECORDS };
    if (newRecordPin) {
      records[newRecordPin.record.id] = newRecordPin.record;
    }
    return records;
  }, [newRecordPin]);

  // 보라 핀(기록 핀) 클릭 핸들러 - summary 표시
  const handleRecordPinClick = (pinId: string | number) => {
    const record = allRecords[pinId];
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
          allPins.map((pin) => (
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
          onClick={() => void navigate(ROUTES.CONNECTION)}
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
