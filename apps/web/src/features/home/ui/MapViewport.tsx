import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapViewportProps } from '@features/home/types/mapViewport';
import type { PinMarkerData } from '@/shared/types/marker';
import { PinOverlay } from '@/infra/map/marker';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import { ROUTES } from '@/router/routes';
import { useMapInstance } from '@/shared/hooks/useMapInstance';
import type { Record as RecordType } from '@/features/record/types';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import { MOCK_RECORDS } from '@/features/record/domain/record.mock';
import { buildGraphFromStoredConnections } from '@/infra/storage/connectionStorage';

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

export default function MapViewport({
  className = '',
  createdRecordPins = [],
  connectedRecords,
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
  const [selectedRecordPublicId, setSelectedRecordPublicId] = useState<
    string | null
  >(null);

  // 연결선 오버레이 관리
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  // 연결된 기록 표시용 연결선 관리
  const connectionPolylineRef = useRef<naver.maps.Polyline | null>(null);

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
    const existingIds = new Set(pins.map((pin) => String(pin.id)));

    // 생성된 모든 기록을 핀으로 추가 (중복 제거)
    createdRecordPins.forEach((pinData) => {
      if (pinData.coordinates) {
        const recordId = String(pinData.record.id);
        // 이미 존재하는 id가 아니면 추가
        if (!existingIds.has(recordId)) {
          const newPin = {
            id: pinData.record.id,
            position: pinData.coordinates,
            variant: 'record' as const,
          };
          pins.push(newPin);
          existingIds.add(recordId);
        }
      }
    });
    return pins;
  }, [createdRecordPins]);

  // 새로 저장된 기록도 포함한 전체 기록 데이터
  const allRecords = useMemo<Record<string | number, RecordType>>(() => {
    const records = { ...MOCK_RECORDS };
    // 생성된 모든 기록 추가
    createdRecordPins.forEach((pinData) => {
      records[pinData.record.id] = pinData.record;
    });
    return records;
  }, [createdRecordPins]);

  // 선택된 기록의 그래프 조회
  const isGraphQueryEnabled = !!selectedRecordPublicId && isMapLoaded;
  const { data: graphData, isError: isGraphError } = useRecordGraph(
    selectedRecordPublicId,
    {
      enabled: isGraphQueryEnabled,
    },
  );

  // 그래프 데이터가 변경되면 연결선 그리기
  // API 실패 시 localStorage의 연결 정보 사용
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !selectedRecordPublicId) {
      return;
    }

    const map = mapInstanceRef.current;

    // 기존 연결선 제거
    polylinesRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });
    polylinesRef.current = [];

    // 그래프 데이터 결정: API 성공 시 사용, 실패 시 localStorage 사용
    const drawGraph = () => {
      let graphToUse: {
        nodes: {
          publicId: string;
          location: { latitude: number; longitude: number };
        }[];
        edges: { fromRecordPublicId: string; toRecordPublicId: string }[];
      } | null = null;

      if (graphData?.data) {
        // API 성공 시 API 데이터 사용
        graphToUse = {
          nodes: graphData.data.nodes.map((node) => ({
            publicId: node.publicId,
            location: node.location,
          })),
          edges: graphData.data.edges.map((edge) => ({
            fromRecordPublicId: edge.fromRecordPublicId,
            toRecordPublicId: edge.toRecordPublicId,
          })),
        };
      } else if (isGraphError) {
        // API 실패 시 localStorage에서 그래프 구성
        graphToUse = buildGraphFromStoredConnections(selectedRecordPublicId);
      }

      if (!graphToUse || graphToUse.nodes.length === 0) {
        return;
      }

      // 노드 위치 맵 생성 (allPins에서 위치 찾기)
      const nodeMap = new Map<string, naver.maps.LatLng>();
      graphToUse.nodes.forEach((node) => {
        // allPins에서 해당 publicId의 핀 찾기
        const pin = allPins.find((p) => String(p.id) === node.publicId);
        if (pin) {
          nodeMap.set(
            node.publicId,
            new naver.maps.LatLng(pin.position.lat, pin.position.lng),
          );
        } else {
          // API에서 받은 위치 정보 사용
          nodeMap.set(
            node.publicId,
            new naver.maps.LatLng(
              node.location.latitude,
              node.location.longitude,
            ),
          );
        }
      });

      // 엣지를 연결선으로 그리기
      graphToUse.edges.forEach((edge) => {
        const fromPos = nodeMap.get(edge.fromRecordPublicId);
        const toPos = nodeMap.get(edge.toRecordPublicId);

        if (fromPos && toPos) {
          const polyline = new naver.maps.Polyline({
            map,
            path: [fromPos, toPos],
            strokeColor: '#6366f1', // indigo-500
            strokeWeight: 2,
            strokeOpacity: 0.6,
            zIndex: 0,
          });
          polylinesRef.current.push(polyline);
        }
      });
    };

    void drawGraph();

    // 정리 함수
    return () => {
      polylinesRef.current.forEach((polyline) => {
        polyline.setMap(null);
      });
      polylinesRef.current = [];
    };
  }, [
    graphData,
    isGraphError,
    selectedRecordPublicId,
    isMapLoaded,
    mapInstanceRef,
    allPins,
  ]);

  // 지도 클릭 이벤트: 다른 곳 클릭 시 연결선 제거
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const handleMapClick = () => {
      // 핀 클릭은 이벤트 전파가 막혀있으므로, 지도 클릭만 처리
      if (selectedRecordPublicId) {
        setSelectedRecordPublicId(null);
        setSelectedRecord(null);
        setIsSummaryOpen(false);
        setSelectedPinId(null);
        // 연결선 제거
        polylinesRef.current.forEach((polyline) => {
          polyline.setMap(null);
        });
        polylinesRef.current = [];
      }
    };

    const listener = naver.maps.Event.addListener(map, 'click', handleMapClick);

    return () => {
      // cleanup 시점에 맵 인스턴스 유효성 확인
      if (map && listener) {
        try {
          // removeListener는 리스너 객체 하나만 받습니다
          (
            naver.maps.Event.removeListener as (
              listener: naver.maps.MapEventListener,
            ) => void
          )(listener);
        } catch {
          // 맵 인스턴스가 이미 제거된 경우 무시
        }
      }
    };
    // ref는 변경되어도 재렌더링을 트리거하지 않으므로 dependency에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, selectedRecordPublicId]);

  // 연결된 기록 표시 (3초간만)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !connectedRecords) {
      // connectedRecords가 없으면 연결선 제거
      if (connectionPolylineRef.current) {
        connectionPolylineRef.current.setMap(null);
        connectionPolylineRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;

    // 기존 연결 표시 제거
    if (connectionPolylineRef.current) {
      connectionPolylineRef.current.setMap(null);
      connectionPolylineRef.current = null;
    }

    // 연결된 두 기록의 위치 찾기
    const fromRecord = allRecords[connectedRecords.fromId];
    const toRecord = allRecords[connectedRecords.toId];

    if (!fromRecord || !toRecord) return;

    // MOCK_PINS에서 위치 찾기
    const fromPin = allPins.find(
      (pin) => String(pin.id) === connectedRecords.fromId,
    );
    const toPin = allPins.find(
      (pin) => String(pin.id) === connectedRecords.toId,
    );

    if (!fromPin || !toPin) return;

    // 연결선 그리기
    const fromPos = new naver.maps.LatLng(
      fromPin.position.lat,
      fromPin.position.lng,
    );
    const toPos = new naver.maps.LatLng(toPin.position.lat, toPin.position.lng);

    connectionPolylineRef.current = new naver.maps.Polyline({
      map,
      path: [fromPos, toPos],
      strokeColor: '#10b981', // green-500
      strokeWeight: 3,
      strokeOpacity: 0.8,
      zIndex: 1, // 그래프 연결선보다 위에 표시
    });

    // 3초 후 자동 제거
    const timer = setTimeout(() => {
      if (connectionPolylineRef.current) {
        connectionPolylineRef.current.setMap(null);
        connectionPolylineRef.current = null;
      }
    }, 3000);

    // 정리 함수
    return () => {
      clearTimeout(timer);
      if (connectionPolylineRef.current) {
        connectionPolylineRef.current.setMap(null);
        connectionPolylineRef.current = null;
      }
    };
  }, [connectedRecords, isMapLoaded, mapInstanceRef, allPins, allRecords]);

  // 보라 핀(기록 핀) 클릭 핸들러 - summary 표시 및 그래프 조회
  const handleRecordPinClick = (pinId: string | number) => {
    const record = allRecords[pinId];
    if (record) {
      const publicId = String(pinId);
      setSelectedRecord(record);
      setIsSummaryOpen(true);
      setSelectedPinId(pinId);
      // record.id가 publicId라고 가정 (실제 API 응답에 따라 조정 필요)
      setSelectedRecordPublicId(publicId);

      // 핀 클릭 시 지도 클릭 이벤트가 실행되지 않도록 플래그 설정
      // (지도 클릭 핸들러의 setTimeout을 취소하기 위해)
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
            setSelectedRecordPublicId(null);
            // 연결선 제거
            polylinesRef.current.forEach((polyline) => {
              polyline.setMap(null);
            });
            polylinesRef.current = [];
          }}
          record={selectedRecord}
        />
      )}
    </>
  );
}
