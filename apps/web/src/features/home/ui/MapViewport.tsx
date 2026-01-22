import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapViewportProps } from '@features/home/types/mapViewport';
import type { PinMarkerData } from '@/shared/types/marker';
import { PinOverlay } from '@/infra/map/marker';
import DraggablePinOverlay from '@/infra/map/marker/DraggablePinOverlay';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import { ROUTES } from '@/router/routes';
import { useMapInstance } from '@/shared/hooks/useMapInstance';
import type { Record as RecordType } from '@/features/record/types';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import { buildGraphFromStoredConnections } from '@/infra/storage/connectionStorage';
import type { Coordinates } from '@/features/record/types';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import type { Record as ApiRecord } from '@locus/shared';
import {
  expandBounds,
  isWithinBounds,
  isNearBoundary,
  isSameGrid,
  type Bounds,
} from '@/features/home/utils/boundsUtils';
import {
  loadMapState,
  saveMapState,
  type MapState,
} from '@/infra/storage/mapStateStorage';

export default function MapViewport({
  className = '',
  createdRecordPins = [],
  connectedRecords,
  targetLocation,
  onTargetLocationChange,
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

  // 모든 가져온 기록을 저장 (확장된 bounds에서 가져온 전체 데이터)
  // 타임스탬프를 함께 저장하여 오래된 순으로 정리 가능
  const [allFetchedRecords, setAllFetchedRecords] = useState<
    Map<string, { record: ApiRecord; timestamp: number }>
  >(new Map());
  // 현재 줌 레벨 추적
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  // ref로 최신 bounds 값 추적 (무한 루프 방지)
  const fetchBoundsRef = useRef<Bounds | null>(null);
  const expandedBoundsRef = useRef<Bounds | null>(null);

  // 연결선 오버레이 관리
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  // 연결된 기록 표시용 연결선 관리
  const connectionPolylineRef = useRef<naver.maps.Polyline | null>(null);

  // 저장된 지도 상태 불러오기
  const savedMapState = useMemo(() => loadMapState(), []);
  const hasRestoredMapStateRef = useRef(false);

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
    zoom: savedMapState?.zoom ?? 13,
    defaultCenter: savedMapState
      ? { lat: savedMapState.center.lat, lng: savedMapState.center.lng }
      : undefined,
    zoomControl: true,
    zoomControlOptions: {
      position: 1, // naver.maps.Position.TOP_RIGHT
    },
    autoCenterToGeolocation: !savedMapState, // 저장된 상태가 있으면 자동 중심 이동 비활성화
  });

  // 현재 화면 bounds 상태 관리 (실제 화면에 보이는 범위)
  const [currentViewBounds, setCurrentViewBounds] = useState<Bounds | null>(
    null,
  );
  // 확장된 bounds로 API 요청 (현재 화면의 4~9배 크기)
  const [fetchBounds, setFetchBounds] = useState<Bounds | null>(null);

  // 확장된 bounds로 기록 조회 (GET /records - 확장 bounds 기반)
  const { data: recordsByBoundsData } = useGetRecordsByBounds(
    fetchBounds
      ? {
          neLat: fetchBounds.neLat,
          neLng: fetchBounds.neLng,
          swLat: fetchBounds.swLat,
          swLng: fetchBounds.swLng,
          page: 1,
          limit: 100, // 충분히 큰 값으로 설정
          sortOrder: 'desc',
        }
      : null,
    {
      enabled: isMapLoaded && fetchBounds !== null,
    },
  );

  // API에서 받아온 데이터를 allFetchedRecords에 누적 저장
  useEffect(() => {
    if (!recordsByBoundsData?.records || !fetchBounds) {
      return;
    }

    const now = Date.now();

    setAllFetchedRecords((prev) => {
      const newMap = new Map(prev);
      recordsByBoundsData.records.forEach((record: ApiRecord) => {
        // 이미 존재하는 경우 타임스탬프는 유지 (오래된 순 정렬을 위해)
        const existing = newMap.get(record.publicId);
        newMap.set(record.publicId, {
          record,
          timestamp: existing?.timestamp ?? now,
        });
      });
      return newMap;
    });

    // ref도 업데이트
    expandedBoundsRef.current = fetchBounds;
  }, [recordsByBoundsData, fetchBounds]);

  // 메모리 관리: 줌 레벨이 낮거나 데이터가 너무 많으면 정리
  useEffect(() => {
    const MAX_RECORDS = 1000; // 최대 기록 수
    const LOW_ZOOM_THRESHOLD = 7; // 전국 단위 줌 레벨

    setAllFetchedRecords((prev) => {
      // 줌 레벨이 낮으면 (전국 단위) 모든 데이터 비우기
      if (currentZoom < LOW_ZOOM_THRESHOLD) {
        return new Map();
      }

      // 1000개를 넘으면 오래된 순으로 정리
      if (prev.size > MAX_RECORDS) {
        const sorted = Array.from(prev.entries()).sort(
          (a, b) => a[1].timestamp - b[1].timestamp,
        );
        // 오래된 것부터 제거 (최대 개수만큼만 유지)
        const toKeep = sorted.slice(-MAX_RECORDS);
        return new Map(toKeep);
      }

      return prev;
    });
  }, [currentZoom]);

  // 클라이언트 필터링: 현재 화면 bounds에 맞는 기록만 필터링
  const visibleApiRecords = useMemo<ApiRecord[]>(() => {
    if (!currentViewBounds || allFetchedRecords.size === 0) {
      return [];
    }

    const visible: ApiRecord[] = [];
    allFetchedRecords.forEach(({ record }) => {
      if (
        isWithinBounds(
          record.location.latitude,
          record.location.longitude,
          currentViewBounds,
        )
      ) {
        visible.push(record);
      }
    });
    return visible;
  }, [currentViewBounds, allFetchedRecords]);

  // 필터링된 기록을 핀 데이터로 변환
  const apiPins = useMemo<PinMarkerData[]>(() => {
    return visibleApiRecords.map((record: ApiRecord) => ({
      id: record.publicId,
      position: {
        lat: record.location.latitude,
        lng: record.location.longitude,
      },
      variant: 'record' as const,
    }));
  }, [visibleApiRecords]);

  const allPins = useMemo<PinMarkerData[]>(() => {
    const pins = [...apiPins];

    const serverIds = new Set(pins.map((pin) => String(pin.id)));

    createdRecordPins.forEach((pinData) => {
      const recordId = String(pinData.record.id);

      if (pinData.coordinates && !serverIds.has(recordId)) {
        pins.push({
          id: pinData.record.id,
          position: pinData.coordinates,
          variant: 'record' as const,
        });
      }
    });

    return pins;
  }, [apiPins, createdRecordPins]);

  // 필터링된 기록을 RecordType으로 변환
  const apiRecords = useMemo<Record<string | number, RecordType>>(() => {
    const records: Record<string | number, RecordType> = {} as Record<
      string | number,
      RecordType
    >;
    visibleApiRecords.forEach((record: ApiRecord) => {
      records[record.publicId] = {
        id: record.publicId,
        text: record.title,
        tags: record.tags,
        location: {
          name: record.location.name ?? '',
          address: record.location.address ?? '',
        },
        createdAt: new Date(record.createdAt),
      };
    });
    return records;
  }, [visibleApiRecords]);

  // 새로 저장된 기록도 포함한 전체 기록 데이터
  const allRecords = useMemo<Record<string | number, RecordType>>(() => {
    const records = { ...apiRecords } as Record<string | number, RecordType>;
    // 생성된 모든 기록 추가
    createdRecordPins.forEach((pinData) => {
      records[pinData.record.id] = pinData.record;
    });
    return records;
  }, [apiRecords, createdRecordPins]);

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

  // 지도 클릭 이벤트: 다른 곳 클릭 시 연결선 제거 또는 기록 생성 바텀시트 열기
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const handleMapClick = (e: naver.maps.PointerEvent) => {
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
      } else {
        // 빈 공간 클릭 시 기록 생성 바텀시트 열기
        const latlng = e.coord as naver.maps.LatLng;
        // 역지오코딩은 나중에 구현하고, 일단 기본값 사용
        setSelectedLocation({
          name: '선택한 위치',
          address: '',
          coordinates: {
            lat: latlng.lat(),
            lng: latlng.lng(),
          },
        });
        setIsBottomSheetOpen(true);
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

  // 좌표를 소수점 4째 자리로 반올림하는 헬퍼 함수
  const roundTo4Decimals = (value: number): number => {
    return Math.round(value * 10000) / 10000;
  };

  // 지도 bounds 업데이트 함수 (useCallback으로 메모이제이션하여 stale closure 방지)
  // ref를 사용하여 무한 루프 방지
  const updateMapBounds = useCallback(() => {
    if (!isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    if (bounds) {
      // 줌 레벨 업데이트 (값이 실제로 변경되었을 때만)
      setCurrentZoom((prevZoom) => {
        if (prevZoom !== zoom) {
          return zoom;
        }
        return prevZoom;
      });

      // Naver Maps의 LatLngBounds는 getNE()와 getSW() 메서드를 제공
      const ne = (bounds as naver.maps.LatLngBounds).getNE(); // 북동쪽 모서리
      const sw = (bounds as naver.maps.LatLngBounds).getSW(); // 남서쪽 모서리

      const currentBounds: Bounds = {
        neLat: roundTo4Decimals(ne.lat()),
        neLng: roundTo4Decimals(ne.lng()),
        swLat: roundTo4Decimals(sw.lat()),
        swLng: roundTo4Decimals(sw.lng()),
      };

      // 현재 화면 bounds 업데이트 (값이 실제로 변경되었을 때만)
      setCurrentViewBounds((prev) => {
        if (
          !prev ||
          prev.neLat !== currentBounds.neLat ||
          prev.neLng !== currentBounds.neLng ||
          prev.swLat !== currentBounds.swLat ||
          prev.swLng !== currentBounds.swLng
        ) {
          return currentBounds;
        }
        return prev;
      });

      // 확장된 bounds 계산 (줌 레벨에 따라 동적 조정)
      const expanded = expandBounds(currentBounds, zoom);

      // ref에서 최신 값 가져오기
      const currentFetchBounds = fetchBoundsRef.current;
      const currentExpandedBounds = expandedBoundsRef.current;

      // fetchBounds가 없거나, 현재 bounds가 확장된 bounds의 경계선에 접근했을 때만 업데이트
      const shouldUpdate =
        !currentFetchBounds ||
        !currentExpandedBounds ||
        isNearBoundary(currentBounds, currentExpandedBounds) ||
        !isSameGrid(expanded, currentFetchBounds);

      if (shouldUpdate) {
        fetchBoundsRef.current = expanded;
        expandedBoundsRef.current = expanded;
        setFetchBounds(expanded);
      }

      // 지도 상태 저장 (중심 좌표와 줌 레벨)
      const center = map.getCenter();
      const naverMaps = window.naver?.maps;
      if (center && naverMaps && center instanceof naverMaps.LatLng) {
        const mapState: MapState = {
          zoom,
          center: {
            lat: roundTo4Decimals(center.lat()),
            lng: roundTo4Decimals(center.lng()),
          },
        };
        saveMapState(mapState);
      }
    }
  }, [isMapLoaded, mapInstanceRef]);

  // 저장된 지도 상태 복원 (초기 로드 시에만)
  useEffect(() => {
    if (
      !isMapLoaded ||
      !mapInstanceRef.current ||
      !savedMapState ||
      hasRestoredMapStateRef.current
    ) {
      return;
    }

    const map = mapInstanceRef.current;
    const naverMaps = window.naver?.maps;
    if (!naverMaps) return;

    // 저장된 상태로 복원
    const savedCenter = new naverMaps.LatLng(
      savedMapState.center.lat,
      savedMapState.center.lng,
    );
    map.setCenter(savedCenter);
    map.setZoom(savedMapState.zoom);
    hasRestoredMapStateRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, savedMapState]);

  // 지도 이동/줌 변경 시 bounds 업데이트
  // idle 이벤트 사용: 사용자가 지도를 움직이다가 멈췄을 때만 한 번 호출 (debounce 불필요)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    // 초기 bounds 설정
    updateMapBounds();

    // idle 이벤트: 지도 이동/줌이 완료된 후 한 번만 호출
    const idleListener = naver.maps.Event.addListener(map, 'idle', () => {
      updateMapBounds();
    });

    // size_changed 이벤트: 지도 크기 변경 시 즉시 업데이트
    const sizeChangedListener = naver.maps.Event.addListener(
      map,
      'size_changed',
      () => {
        updateMapBounds();
      },
    );

    return () => {
      naver.maps.Event.removeListener(idleListener);
      naver.maps.Event.removeListener(sizeChangedListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, updateMapBounds]);

  // 검색 결과 위치로 지도 이동
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !targetLocation) {
      return;
    }

    const map = mapInstanceRef.current;
    const naverMaps = window.naver?.maps;
    if (!naverMaps) return;

    const targetPosition = new naverMaps.LatLng(
      targetLocation.lat,
      targetLocation.lng,
    );
    map.setCenter(targetPosition);
    map.setZoom(15); // 검색 결과 위치로 이동 시 줌 레벨 조정
  }, [isMapLoaded, mapInstanceRef, targetLocation]);

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

    // allPins에서 위치 찾기
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

        {/* 검색 결과 위치 파란 핀 (드래그 가능) */}
        {isMapLoaded && mapInstanceRef.current && targetLocation && (
          <DraggablePinOverlay
            key="search-location"
            map={mapInstanceRef.current}
            pin={{
              id: 'search-location',
              position: targetLocation,
              variant: 'current',
            }}
            isSelected={false}
            onClick={() => {
              // 검색 결과 위치 클릭 시 기록 작성 페이지로 이동
              void navigate(ROUTES.RECORD, {
                state: {
                  location: {
                    name: '검색한 위치',
                    address: '',
                    coordinates: targetLocation,
                  },
                },
              });
            }}
            onDragEnd={(newPosition: Coordinates) => {
              // 드래그 종료 시 위치 업데이트
              if (onTargetLocationChange) {
                onTargetLocationChange(newPosition);
              }
              // 지도 중심도 함께 이동
              if (mapInstanceRef.current) {
                const naverMaps = window.naver?.maps;
                if (naverMaps) {
                  mapInstanceRef.current.setCenter(
                    new naverMaps.LatLng(newPosition.lat, newPosition.lng),
                  );
                }
              }
            }}
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
          coordinates={selectedLocation.coordinates}
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
