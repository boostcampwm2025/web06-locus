import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import type { MapViewportProps } from '@features/home/types/mapViewport';
import type { PinMarkerData } from '@/shared/types/marker';
import { PinOverlay } from '@/infra/map/marker';
import DraggablePinOverlay from '@/infra/map/marker/DraggablePinOverlay';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import ClusterRecordBottomSheet from '@/features/record/ui/ClusterRecordBottomSheet';
import { ROUTES } from '@/router/routes';
import { useMapInstance } from '@/shared/hooks/useMapInstance';
import type {
  Record as RecordType,
  LocationWithCoordinates,
} from '@/features/record/types';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import { buildGraphFromStoredConnections } from '@/infra/storage/connectionStorage';
import type { Coordinates } from '@/features/record/types';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { useGetRecordDetail } from '@/features/record/hooks/useGetRecordDetail';
import type { Record as ApiRecord } from '@locus/shared';
import {
  expandBounds,
  isWithinBounds,
  isNearBoundary,
  isSameGrid as isSameGridBounds,
  isSameGridCenter,
  getGridCellKey,
  type Bounds,
} from '@/features/home/utils/boundsUtils';
import {
  loadMapState,
  saveMapState,
  type MapState,
} from '@/infra/storage/mapStateStorage';
import { extractTagNames } from '@/shared/utils/tagUtils';
import { useDuckScenario } from '@/shared/hooks/useDuckScenario';
import { useDuckCommentsStore } from '@/features/home/domain/duckCommentsStore';
import { DuckMapSceneCrossing } from '@/shared/ui/duck';

export default function MapViewport({
  className = '',
  createdRecordPins = [],
  connectedRecords,
  targetLocation,
  onTargetLocationChange,
  onCreateRecord,
  onRecordPinClick,
  renderLocationConfirmation,
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
  const [selectedClusterRecords, setSelectedClusterRecords] = useState<
    RecordType[] | null
  >(null);
  const [selectedRecordPublicId, setSelectedRecordPublicId] = useState<
    string | null
  >(null);
  /** "이 장소와 연결된 기록 확인" 클릭 시에만 연결선 표시 (바텀시트 열릴 때는 미표시) */
  const [showConnectionLinesForRecordId, setShowConnectionLinesForRecordId] =
    useState<string | null>(null);

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
  // 이전 중심점 저장 (리사이즈로 인한 불필요한 API 호출 방지)
  const previousCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // 연결선 오버레이 관리
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  // 연결된 기록 표시용 연결선 관리
  const connectionPolylineRef = useRef<naver.maps.Polyline | null>(null);
  // 지도 영역 크기 측정 (오리 레이어 초기 위치·높이용)
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const [duckContainerSize, setDuckContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // 저장된 지도 상태 불러오기
  const savedMapState = useMemo(() => loadMapState(), []);
  const hasRestoredMapStateRef = useRef(false);

  // 오리 시나리오: 노출 여부 (시나리오 조건·확률은 별도 로직에서 설정)
  const isDuckVisible = useDuckScenario((s) => s.isVisible);
  const setDuckScenario = useDuckScenario((s) => s.setScenario);
  const hasTriggeredDuckRef = useRef(false);

  // 오리 말풍선용 코멘트 풀. 지도 준비 시 1회, 기록 생성 시마다 갱신
  const duckComments = useDuckCommentsStore((s) => s.comments);
  const refreshDuckComments = useDuckCommentsStore((s) => s.refreshComments);

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
    onMapReady: () => {
      void refreshDuckComments();
    },
  });

  // 현재 화면 bounds 상태 관리 (실제 화면에 보이는 범위)
  const [currentViewBounds, setCurrentViewBounds] = useState<Bounds | null>(
    null,
  );
  // 확장된 bounds로 API 요청 (현재 화면의 4~9배 크기)
  const [fetchBounds, setFetchBounds] = useState<Bounds | null>(null);

  // 확장된 bounds로 기록 조회 (GET /records - 확장 bounds 기반)
  // 지도 뷰 + 클러스터링용: 좌표 포함 데이터 필요
  const { data: recordsByBoundsData } = useGetRecordsByBounds(
    fetchBounds
      ? {
          neLat: fetchBounds.neLat,
          neLng: fetchBounds.neLng,
          swLat: fetchBounds.swLat,
          swLng: fetchBounds.swLng,
          page: 1,
          limit: 100, //  클러스터링용 100개 제한
          sortOrder: 'desc',
        }
      : null,
    {
      enabled: isMapLoaded && fetchBounds !== null,
    },
  );

  // API에서 받아온 데이터를 allFetchedRecords에 반영
  // fetchBounds 구간 내 기존 기록을 제거 후 새 API 응답으로 교체 (삭제 반영)
  useEffect(() => {
    if (!recordsByBoundsData?.records || !fetchBounds) {
      return;
    }

    const now = Date.now();

    setAllFetchedRecords((prev) => {
      const newMap = new Map(prev);

      // fetchBounds 내 기존 기록 제거 (삭제된 기록 반영)
      const toRemove: string[] = [];
      newMap.forEach((entry, publicId) => {
        if (
          isWithinBounds(
            entry.record.location.latitude,
            entry.record.location.longitude,
            fetchBounds,
          )
        ) {
          toRemove.push(publicId);
        }
      });
      toRemove.forEach((id) => newMap.delete(id));

      // 새 API 응답으로 추가/갱신
      recordsByBoundsData.records.forEach((record: ApiRecord) => {
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

  // 그리드 클러스터링: visibleApiRecords를 줌 기반 그리드로 묶어 단일/클러스터 핀 생성
  const { apiPins, clusterDataMap } = useMemo(() => {
    const map = new Map<string, string[]>();
    const pins: PinMarkerData[] = [];

    if (visibleApiRecords.length === 0) {
      return { apiPins: pins, clusterDataMap: map };
    }

    // 그리드 셀별로 기록 그룹화 (셀 키 -> ApiRecord[])
    const groups = new Map<string, ApiRecord[]>();
    for (const record of visibleApiRecords) {
      const key = getGridCellKey(
        record.location.latitude,
        record.location.longitude,
        currentZoom,
      );
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }

    // 셀별로 정렬: 최신순(대표 기록 = 첫 번째)
    groups.forEach((arr) => {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });

    for (const [cellKey, records] of groups) {
      if (records.length === 1) {
        const r = records[0];
        pins.push({
          id: r.publicId,
          position: {
            lat: r.location.latitude,
            lng: r.location.longitude,
          },
          variant: 'record',
        });
      } else {
        const clusterId = `cluster_${cellKey}`;
        const latSum = records.reduce((s, r) => s + r.location.latitude, 0);
        const lngSum = records.reduce((s, r) => s + r.location.longitude, 0);
        map.set(
          clusterId,
          records.map((r) => r.publicId),
        );
        pins.push({
          id: clusterId,
          position: {
            lat: latSum / records.length,
            lng: lngSum / records.length,
          },
          variant: 'cluster',
          count: records.length,
        });
      }
    }

    return { apiPins: pins, clusterDataMap: map };
  }, [visibleApiRecords, currentZoom]);

  const allPins = useMemo<PinMarkerData[]>(() => {
    const allRecordIds = new Set<string>();
    apiPins.forEach((pin) => {
      if (pin.variant === 'record') allRecordIds.add(String(pin.id));
      if (pin.variant === 'cluster') {
        const ids = clusterDataMap.get(String(pin.id));
        ids?.forEach((id) => allRecordIds.add(id));
      }
    });

    const pins = [...apiPins];

    createdRecordPins.forEach((pinData) => {
      const recordId = String(pinData.record.id);
      if (pinData.coordinates && !allRecordIds.has(recordId)) {
        pins.push({
          id: pinData.record.id,
          position: pinData.coordinates,
          variant: 'record' as const,
        });
      }
    });

    return pins;
  }, [apiPins, clusterDataMap, createdRecordPins]);

  // 필터링된 기록을 RecordType으로 변환 (이미지 URL 목록 포함)
  const apiRecords = useMemo<Record<string | number, RecordType>>(() => {
    const records: Record<string | number, RecordType> = {} as Record<
      string | number,
      RecordType
    >;
    visibleApiRecords.forEach((record: ApiRecord) => {
      const rawImages =
        'images' in record
          ? (
              record as {
                images?: {
                  medium?: { url?: string };
                  thumbnail?: { url?: string };
                  original?: { url?: string };
                }[];
              }
            ).images
          : undefined;
      const images =
        rawImages
          ?.map(
            (img) => img.medium?.url ?? img.thumbnail?.url ?? img.original?.url,
          )
          .filter((url): url is string => Boolean(url)) ?? [];
      records[record.publicId] = {
        id: record.publicId,
        text: record.title,
        tags: extractTagNames(record.tags),
        location: {
          name: record.location.name ?? '',
          address: record.location.address ?? '',
        },
        createdAt: new Date(record.createdAt),
        ...(images.length > 0 ? { images } : {}),
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

  const recordCoordinatesMap = useMemo<
    Record<string | number, Coordinates>
  >(() => {
    const map: Record<string | number, Coordinates> = {};
    visibleApiRecords.forEach((record) => {
      map[record.publicId] = {
        lat: record.location.latitude,
        lng: record.location.longitude,
      };
    });
    createdRecordPins.forEach((pinData) => {
      if (pinData.coordinates) {
        map[pinData.record.id] = pinData.coordinates;
      }
    });
    return map;
  }, [visibleApiRecords, createdRecordPins]);

  // 연결된 두 기록 상세 (지도 bounds 밖이어도 연결선 그리기용)
  const fromRecordId = connectedRecords?.fromId ?? null;
  const toRecordId = connectedRecords?.toId ?? null;
  const { data: fromRecordDetail } = useGetRecordDetail(fromRecordId, {
    enabled: !!fromRecordId,
  });
  const { data: toRecordDetail } = useGetRecordDetail(toRecordId, {
    enabled: !!toRecordId,
  });

  // 그래프 조회: 핀 선택 시(edges 개수로 버튼 노출) + 버튼 클릭 시(연결선 그리기)
  const graphQueryRecordId =
    selectedRecordPublicId ?? showConnectionLinesForRecordId;
  const isGraphQueryEnabled = !!graphQueryRecordId && isMapLoaded;
  const { data: graphData, isError: isGraphError } = useRecordGraph(
    graphQueryRecordId,
    {
      enabled: isGraphQueryEnabled,
    },
  );

  // 그래프 데이터가 변경되면 연결선 그리기
  // API 실패 시 localStorage의 연결 정보 사용
  useEffect(() => {
    if (
      !isMapLoaded ||
      !mapInstanceRef.current ||
      !showConnectionLinesForRecordId
    ) {
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
        graphToUse = buildGraphFromStoredConnections(
          showConnectionLinesForRecordId,
        );
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
            strokeColor: '#6366f1',
            strokeWeight: 3,
            strokeOpacity: 0.5,
            strokeStyle: 'shortdash',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            zIndex: 0,
          });
          polylinesRef.current.push(polyline);

          setTimeout(() => {
            polyline.setMap(null);
          }, 5000);
        }
      });
    };

    drawGraph();

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
    showConnectionLinesForRecordId,
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
      if (selectedRecordPublicId || showConnectionLinesForRecordId) {
        setSelectedRecordPublicId(null);
        setSelectedRecord(null);
        setIsSummaryOpen(false);
        setSelectedPinId(null);
        setShowConnectionLinesForRecordId(null);
        // 연결선 제거
        polylinesRef.current.forEach((polyline) => {
          polyline.setMap(null);
        });
        polylinesRef.current = [];
      } else {
        // 빈 공간 클릭 시 기록 생성 바텀시트/모달 열기 (데스크톱은 하단 중앙 고정 모달)
        const latlng = e.coord as naver.maps.LatLng;
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
  }, [
    isMapLoaded,
    selectedRecordPublicId,
    showConnectionLinesForRecordId,
    renderLocationConfirmation,
  ]);

  // 지도 로드 후 한 번만 오리 노출 트리거 (시나리오·확률 로직은 별도에서 확장 가능)
  useEffect(() => {
    if (!isMapLoaded || hasTriggeredDuckRef.current) return;
    hasTriggeredDuckRef.current = true;
    const t = setTimeout(() => {
      setDuckScenario('IDLE', true);
    }, 800);
    return () => clearTimeout(t);
  }, [isMapLoaded, setDuckScenario]);

  // 오리 레이어용 지도 영역 크기 측정 (isDuckVisible일 때만, 리사이즈 대응)
  useEffect(() => {
    if (!isMapLoaded || !isDuckVisible || !mapAreaRef.current) return;
    const el = mapAreaRef.current;
    const update = () => {
      if (el)
        setDuckContainerSize({
          width: el.clientWidth,
          height: el.clientHeight,
        });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMapLoaded, isDuckVisible]);

  // 좌표를 소수점 4째 자리로 반올림하는 헬퍼 함수
  const roundTo4Decimals = (value: number): number => {
    return Math.round(value * 10000) / 10000;
  };

  // 지도 bounds 업데이트 함수 (useCallback으로 메모이제이션하여 stale closure 방지)
  // ref를 사용하여 무한 루프 방지
  const updateMapBounds = useCallback(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !mapContainerRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;

    // 컨테이너 0x0이면 스킵. useMapInstance(waitForContainerSize)가 초기 공간을 보장하고,
    // 이후엔 ResizeObserver/지도 이벤트로 updateMapBounds가 다시 호출됨.
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      return;
    }

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

      // 원본 bounds 값
      let rawNeLat = ne.lat();
      let rawSwLat = sw.lat();
      let rawNeLng = ne.lng();
      let rawSwLng = sw.lng();

      // ③ neLat === swLat일 때 강제로 범위 확장 (가짜 영역 생성)
      // 지도가 0x0 상태에서 중심점만 반환되는 경우 방지
      const MIN_BOUNDS_DIFF = 0.0001;
      if (rawNeLat === rawSwLat) {
        rawNeLat += MIN_BOUNDS_DIFF;
        rawSwLat -= MIN_BOUNDS_DIFF;
      }
      if (rawNeLng === rawSwLng) {
        rawNeLng += MIN_BOUNDS_DIFF;
        rawSwLng -= MIN_BOUNDS_DIFF;
      }

      // 위도/경도 차이 재계산
      const rawLatDiff = rawNeLat - rawSwLat;
      const rawLngDiff = rawNeLng - rawSwLng;

      // 현재 중심점 가져오기 (fallback bounds 생성에 필요)
      const center = map.getCenter();
      const naverMaps = window.naver?.maps;
      const currentCenter =
        center && naverMaps && center instanceof naverMaps.LatLng
          ? { lat: center.lat(), lng: center.lng() }
          : null;

      // 여전히 유효하지 않으면 (매우 드문 경우) 스킵하되 fetchBounds는 유지
      if (rawLatDiff < MIN_BOUNDS_DIFF || rawLngDiff < MIN_BOUNDS_DIFF) {
        // 이전에 유효한 bounds가 있으면 유지, 없으면 강제로 최소 범위 생성
        if (!fetchBoundsRef.current) {
          const fallbackBounds: Bounds = {
            neLat: roundTo4Decimals(rawNeLat + MIN_BOUNDS_DIFF),
            neLng: roundTo4Decimals(rawNeLng + MIN_BOUNDS_DIFF),
            swLat: roundTo4Decimals(rawSwLat - MIN_BOUNDS_DIFF),
            swLng: roundTo4Decimals(rawSwLng - MIN_BOUNDS_DIFF),
          };
          const expanded = expandBounds(fallbackBounds, zoom);
          fetchBoundsRef.current = expanded;
          expandedBoundsRef.current = expanded;
          setFetchBounds(expanded);
        }
        return;
      }

      // 현재 bounds 계산
      const currentBounds: Bounds = {
        neLat: roundTo4Decimals(rawNeLat),
        neLng: roundTo4Decimals(rawNeLng),
        swLat: roundTo4Decimals(rawSwLat),
        swLng: roundTo4Decimals(rawSwLng),
      };

      // 중심점 기반 가드: 리사이즈로 인한 BBox 변화인지 확인
      // 중심점이 같은 격자 내에 있으면서 bounds도 같은 그리드에 있으면 리사이즈로 인한 변화로 간주하고 무시
      const centerInSameGrid =
        currentCenter &&
        previousCenterRef.current &&
        isSameGridCenter(
          currentCenter.lat,
          currentCenter.lng,
          previousCenterRef.current.lat,
          previousCenterRef.current.lng,
        );

      // 이전 bounds와 현재 bounds를 그리드 단위로 비교
      const boundsInSameGrid =
        currentViewBounds && isSameGridBounds(currentBounds, currentViewBounds);

      // 중심점과 bounds 모두 같은 그리드에 있으면 리사이즈로 인한 변화로 간주 (API 호출·state 업데이트 스킵)
      if (centerInSameGrid && boundsInSameGrid) {
        if (currentCenter) {
          previousCenterRef.current = currentCenter;
        }
        return; // currentViewBounds 갱신 없이 종료 → 불필요한 리렌더 방지
      }

      // 중심점이 이동했거나 bounds가 달라졌거나 첫 호출인 경우 정상 처리
      // 중심점 저장
      if (currentCenter) {
        previousCenterRef.current = currentCenter;
      }

      // 현재 화면 bounds 업데이트 (값이 실제로 변경되었을 때만)
      setCurrentViewBounds((prev) => {
        if (
          !prev ||
          prev?.neLat !== currentBounds.neLat ||
          prev?.neLng !== currentBounds.neLng ||
          prev?.swLat !== currentBounds.swLat ||
          prev?.swLng !== currentBounds.swLng
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
      const isSameGrid = currentFetchBounds
        ? isSameGridBounds(expanded, currentFetchBounds)
        : false;
      const isNear = currentExpandedBounds
        ? isNearBoundary(currentBounds, currentExpandedBounds)
        : false;
      const shouldUpdate =
        !currentFetchBounds || !currentExpandedBounds || isNear || !isSameGrid;

      if (shouldUpdate) {
        fetchBoundsRef.current = expanded;
        expandedBoundsRef.current = expanded;
        setFetchBounds(expanded);
      }

      // 지도 상태 저장 (중심 좌표와 줌 레벨)
      // currentCenter는 이미 위에서 계산됨
      if (currentCenter) {
        const mapState: MapState = {
          zoom,
          center: {
            lat: roundTo4Decimals(currentCenter.lat),
            lng: roundTo4Decimals(currentCenter.lng),
          },
        };
        saveMapState(mapState);
      }
    }
  }, [isMapLoaded, mapInstanceRef, mapContainerRef]);

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
  // idle 이벤트와 tilesloaded 이벤트 사용
  // tilesloaded: 지도 타일이 모두 로드된 후 호출 (초기 로드 시 중요)
  // idle: 지도 이동/줌/리사이즈가 모두 완료된 후 호출
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    // 초기 bounds 설정
    updateMapBounds();

    // ① tilesloaded 이벤트: 지도 타일이 모두 그려졌을 때 호출
    // 지도가 완전히 로드되기 전에 bounds를 가져오는 문제 방지
    const tilesLoadedListener = naver.maps.Event.addListener(
      map,
      'tilesloaded',
      () => {
        updateMapBounds();
      },
    );

    // idle 이벤트: 지도 이동/줌/리사이즈가 모두 완료된 후 한 번만 호출
    // 리사이징 중에는 호출되지 않고, 완료 후 자동으로 트리거됨
    const idleListener = naver.maps.Event.addListener(map, 'idle', () => {
      updateMapBounds();
    });

    return () => {
      naver.maps.Event.removeListener(tilesLoadedListener);
      naver.maps.Event.removeListener(idleListener);
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

  // 연결된 기록 표시 (8초간만) — allPins에 없어도 상세 조회 좌표로 선 표시(데스크톱 사이드바 연결 등)
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

    // 위치 결정: allPins 우선, 없으면 상세 조회 결과(fromRecordDetail, toRecordDetail) 사용
    const fromPin = allPins.find(
      (pin) => String(pin.id) === connectedRecords.fromId,
    );
    const toPin = allPins.find(
      (pin) => String(pin.id) === connectedRecords.toId,
    );

    const getCoords = (): {
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
    } | null => {
      if (fromPin && toPin) {
        return {
          from: fromPin.position,
          to: toPin.position,
        };
      }
      const fromLoc = fromRecordDetail?.location as
        | { latitude?: number; longitude?: number }
        | undefined;
      const toLoc = toRecordDetail?.location as
        | { latitude?: number; longitude?: number }
        | undefined;
      if (
        fromLoc?.latitude != null &&
        fromLoc?.longitude != null &&
        toLoc?.latitude != null &&
        toLoc?.longitude != null
      ) {
        return {
          from: { lat: fromLoc.latitude, lng: fromLoc.longitude },
          to: { lat: toLoc.latitude, lng: toLoc.longitude },
        };
      }
      return null;
    };

    const coords = getCoords();
    if (!coords) return;

    const fromPos = new naver.maps.LatLng(coords.from.lat, coords.from.lng);
    const toPos = new naver.maps.LatLng(coords.to.lat, coords.to.lng);

    connectionPolylineRef.current = new naver.maps.Polyline({
      map,
      path: [fromPos, toPos],
      strokeColor: '#9333ea', // purple-600 (보라색 핀에 맞춘 진한 보라색)
      strokeWeight: 5, // 더 두껍게
      strokeOpacity: 0.9, // 더 선명하게
      zIndex: 1, // 그래프 연결선보다 위에 표시
    });

    // 8초 후 자동 제거
    const timer = setTimeout(() => {
      if (connectionPolylineRef.current) {
        connectionPolylineRef.current.setMap(null);
        connectionPolylineRef.current = null;
      }
    }, 8000);

    // 정리 함수
    return () => {
      clearTimeout(timer);
      if (connectionPolylineRef.current) {
        connectionPolylineRef.current.setMap(null);
        connectionPolylineRef.current = null;
      }
    };
  }, [
    connectedRecords,
    isMapLoaded,
    mapInstanceRef,
    allPins,
    fromRecordDetail,
    toRecordDetail,
  ]);

  // 보라 핀(기록/클러스터) 클릭 핸들러 - summary 또는 클러스터 바텀시트, onRecordPinClick 위임
  const handleRecordPinClick = (pinId: string | number) => {
    const idStr = String(pinId);
    setSelectedPinId(pinId);

    const clusterRecordIds = clusterDataMap.get(idStr);
    if (clusterRecordIds && clusterRecordIds.length > 0) {
      const clusterRecordsList = clusterRecordIds
        .map((id) => allRecords[id])
        .filter((r): r is RecordType => r != null);
      const topRecordId = clusterRecordIds[0];
      if (!topRecordId) return;

      setSelectedRecordPublicId(topRecordId);

      const onPinClick = onRecordPinClick;
      if (onPinClick) {
        let sharedCoordinates: Coordinates | undefined;
        const coordinateList = clusterRecordIds
          .map((id) => recordCoordinatesMap[id])
          .filter((coord): coord is Coordinates => coord != null);
        if (
          coordinateList.length === clusterRecordIds.length &&
          coordinateList.every(
            (coord) =>
              coord.lat === coordinateList[0]?.lat &&
              coord.lng === coordinateList[0]?.lng,
          )
        ) {
          sharedCoordinates = coordinateList[0];
        }
        onPinClick(topRecordId, {
          clusterRecordIds,
          clusterRecords: clusterRecordsList,
          ...(sharedCoordinates ? { coordinates: sharedCoordinates } : {}),
        });
        return;
      }
      setSelectedClusterRecords(clusterRecordsList);
      setSelectedRecord(null);
      setIsSummaryOpen(false);
      return;
    }

    const publicId = idStr;
    setSelectedRecordPublicId(publicId);
    const onPinClick = onRecordPinClick;
    if (onPinClick) {
      const singleRecord = allRecords[publicId];
      const coordinates = recordCoordinatesMap[publicId];
      const meta =
        singleRecord || coordinates ? { singleRecord, coordinates } : undefined;
      onPinClick(publicId, meta);
      return;
    }
    const record = allRecords[pinId];
    if (record) {
      setSelectedRecord(record);
      setSelectedClusterRecords(null);
      setIsSummaryOpen(true);
    }
  };

  // 파란 핀(현재 위치) 클릭 핸들러 - 기록 작성 페이지로 이동
  const handleCurrentLocationClick = () => {
    if (latitude !== null && longitude !== null) {
      if (onCreateRecord) {
        onCreateRecord(
          {
            name: '현재 위치',
            address: '현재 위치',
          },
          { lat: latitude, lng: longitude },
        );
      } else {
        // 하위 호환성: onCreateRecord가 없으면 기존 방식 사용
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
    }
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedPinId(null);
    setSelectedLocation(null);
  };

  const handleConfirmRecord = () => {
    if (!selectedLocation) return;

    const locationToUse = selectedLocation;
    setIsBottomSheetOpen(false);
    setSelectedLocation(null);
    setSelectedPinId(null);

    if (onCreateRecord) {
      // MainMapPage의 상태 관리 사용 (사이드패널 오픈) — 모달은 이미 닫힘
      onCreateRecord(
        {
          name: locationToUse.name,
          address: locationToUse.address,
        },
        locationToUse.coordinates,
      );
    } else {
      // 하위 호환성: onCreateRecord가 없으면 기존 방식 사용
      if (selectedPinId) {
        void navigate(`${ROUTES.RECORD}?locationId=${selectedPinId}`, {
          state: {
            location: locationToUse,
          },
        });
      } else {
        void navigate(ROUTES.RECORD, {
          state: {
            location: locationToUse,
          },
        });
      }
    }
  };

  return (
    <>
      <div
        ref={mapAreaRef}
        className={`relative flex-1 bg-gray-100 min-h-0 h-full w-full ${className || ''}`}
        style={{ minHeight: '500px' }}
        aria-label="지도 영역"
      >
        {/* 지도 컨테이너 - 항상 렌더링 (ref를 위해 필요) */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: 'inherit' }}
        />

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

        {/* 파란 핀: 지도 클릭으로 위치를 선택했으면 그 위치에만 표시, 아니면 현재 위치에 표시 */}
        {isMapLoaded &&
          mapInstanceRef.current &&
          selectedLocation?.coordinates && (
            <PinOverlay
              key="selected-location"
              map={mapInstanceRef.current}
              pin={{
                id: 'selected-location',
                position: selectedLocation.coordinates,
                variant: 'current',
              }}
              isSelected={false}
            />
          )}
        {isMapLoaded &&
          mapInstanceRef.current &&
          !selectedLocation &&
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
              if (onCreateRecord) {
                onCreateRecord(
                  {
                    name: '검색한 위치',
                    address: '',
                  },
                  targetLocation,
                );
              } else {
                // 하위 호환성
                void navigate(ROUTES.RECORD, {
                  state: {
                    location: {
                      name: '검색한 위치',
                      address: '',
                      coordinates: targetLocation,
                    },
                  },
                });
              }
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

        {/* 오리 마스코트 레이어: 끝→끝 연속 이동, 레이어는 클릭 통과(지도/마커 클릭 가능) */}
        {isMapLoaded && isDuckVisible && duckContainerSize && (
          <div
            className="absolute inset-0 z-5 pointer-events-none"
            aria-hidden="true"
          >
            <DuckMapSceneCrossing
              containerSize={duckContainerSize}
              duration={25}
              bounce
              height="100%"
              comments={duckComments}
            />
          </div>
        )}

        {/* 연결 모드 FAB (데스크톱에서는 미표시) */}
        {!onRecordPinClick && (
          <button
            type="button"
            onClick={() => void navigate(ROUTES.CONNECTION)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 z-10"
            aria-label="연결 모드"
          >
            연결 모드
          </button>
        )}
      </div>
      {/* 기록 작성용: 데스크톱은 LocationConfirmation, 모바일은 RecordCreateBottomSheet */}
      {selectedLocation &&
        (renderLocationConfirmation ? (
          <AnimatePresence>
            {(() => {
              const render = renderLocationConfirmation;
              return typeof render === 'function'
                ? render({
                    location: {
                      name: selectedLocation.name,
                      address: selectedLocation.address,
                      coordinates: selectedLocation.coordinates,
                    },
                    onConfirm: handleConfirmRecord,
                    onCancel: handleCloseBottomSheet,
                  })
                : null;
            })()}
          </AnimatePresence>
        ) : (
          <RecordCreateBottomSheet
            isOpen={isBottomSheetOpen}
            onClose={handleCloseBottomSheet}
            locationName={selectedLocation.name}
            address={selectedLocation.address}
            coordinates={selectedLocation.coordinates}
            onConfirm={handleConfirmRecord}
          />
        ))}

      {/* 기록 Summary Bottom Sheet (onRecordPinClick 제공 시 미표시). publicId로 넘겨 상세 API GET /records/{publicId} 호출 → 이미지 등 전체 데이터 표시 */}
      {selectedRecord && selectedRecordPublicId && !onRecordPinClick && (
        <RecordSummaryBottomSheet
          isOpen={isSummaryOpen}
          onClose={() => {
            setIsSummaryOpen(false);
            setSelectedRecord(null);
            setSelectedRecordPublicId(null);
            setShowConnectionLinesForRecordId(null);
            polylinesRef.current.forEach((polyline) => {
              polyline.setMap(null);
            });
            polylinesRef.current = [];
          }}
          record={selectedRecordPublicId}
          hasConnectedRecords={
            (graphData?.data?.edges?.length ?? 0) > 0 &&
            graphQueryRecordId === selectedRecordPublicId
          }
          onShowLinkedRecords={() => {
            setShowConnectionLinesForRecordId(selectedRecordPublicId);
            setIsSummaryOpen(false);
            setSelectedRecord(null);
            setSelectedRecordPublicId(null);
          }}
          onAddRecord={(loc: LocationWithCoordinates) => {
            setIsSummaryOpen(false);
            setSelectedRecord(null);
            setSelectedRecordPublicId(null);
            setShowConnectionLinesForRecordId(null);
            polylinesRef.current.forEach((polyline) => {
              polyline.setMap(null);
            });
            polylinesRef.current = [];
            void navigate(ROUTES.RECORD, {
              state: {
                location: {
                  name: loc.name,
                  address: loc.address,
                  coordinates: loc.coordinates,
                },
              },
            });
          }}
        />
      )}

      {/* 클러스터 기록 Bottom Sheet: 대표 1개 + 슬라이드업 시 전체 목록 */}
      {selectedClusterRecords &&
        selectedClusterRecords.length > 0 &&
        !onRecordPinClick && (
          <ClusterRecordBottomSheet
            isOpen={true}
            onClose={() => {
              setSelectedClusterRecords(null);
              setSelectedRecordPublicId(null);
              setSelectedPinId(null);
              polylinesRef.current.forEach((polyline) => {
                polyline.setMap(null);
              });
              polylinesRef.current = [];
            }}
            topRecord={selectedClusterRecords[0]}
            clusterRecords={selectedClusterRecords}
            onRecordClick={(recordId: string) => {
              void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
            }}
          />
        )}
    </>
  );
}
