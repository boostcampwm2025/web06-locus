import { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DesktopSidebar } from '@/shared/ui/desktop';
import { LocationConfirmation } from '@/shared/ui/location';
import MapLoadingSkeleton from '@/shared/ui/loading/MapLoadingSkeleton';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';
import TagManagementModal from '@/features/record/ui/TagManagementModal';
import RecordConnectionDrawer from '@/features/connection/ui/desktop/RecordConnectionDrawer';
import { RecordWritePageDesktop } from '@/features/record/ui/desktop/RecordWritePage.desktop';
import { useConnectionStore } from '@/features/connection/domain/connectionStore';
import { useGeocodeSearch } from '@/features/home/hooks/useGeocodeSearch';
import { ROUTES } from '@/router/routes';
import {
  getStoredRecordPins,
  addStoredRecordPin,
} from '@/infra/storage/recordStorage';
import type { Record, Coordinates, Location } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';
import type { StoredRecordPin } from '@/infra/types/storage';
import type { GeocodeAddress } from '@/infra/types/map';
import MapViewport from '../MapViewport';
import SearchResultsPanel from '../SearchResultsPanel';

export function MainMapPageDesktop() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] =
    useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [pinSelectedRecordIds, setPinSelectedRecordIds] = useState<
    string[] | null
  >(null);
  const [pinSelectedLocationWithCoords, setPinSelectedLocationWithCoords] =
    useState<{
      location: Location;
      coordinates: Coordinates;
    } | null>(null);
  const [pinSelectedRecordsOverride, setPinSelectedRecordsOverride] = useState<
    | {
        id: string;
        title: string;
        location: Location;
        date: Date;
        tags: string[];
        imageUrl?: string;
        connectionCount?: number;
      }[]
    | null
  >(null);
  const [isRecordWriteOpen, setIsRecordWriteOpen] = useState(false);
  const [recordWriteLocation, setRecordWriteLocation] =
    useState<Location | null>(null);
  const [recordWriteCoordinates, setRecordWriteCoordinates] = useState<
    Coordinates | undefined
  >(undefined);

  // 연결 모드 상태는 store에서 관리
  const connectionFromRecordId = useConnectionStore(
    (state) => state.connectionFromRecordId,
  );
  const startConnection = useConnectionStore((state) => state.startConnection);
  const cancelConnection = useConnectionStore(
    (state) => state.cancelConnection,
  );

  // 생성된 기록들을 누적해서 관리
  const [createdRecordPins, setCreatedRecordPins] = useState<
    {
      record: Record;
      coordinates?: Coordinates;
    }[]
  >(() => {
    const stored = getStoredRecordPins();
    return stored.map((storedPin) => ({
      record: storedPin.record,
      coordinates: storedPin.coordinates,
    }));
  });

  const [connectedRecords, setConnectedRecords] = useState<{
    fromId: string;
    toId: string;
  } | null>(null);

  const [targetLocation, setTargetLocation] = useState<Coordinates | null>(
    null,
  );

  /** 지도 우측 상단 장소 검색 전용 (사이드바 검색과 분리) */
  const [mapPlaceSearchQuery, setMapPlaceSearchQuery] = useState('');

  /**
   * 1. 지오코딩 API 훅 (지도 장소 검색 전용)
   */
  const {
    data: geocodeData,
    isLoading: isGeocoding,
    error: geocodeError,
  } = useGeocodeSearch('', {
    controlled: true,
    controlledQuery: mapPlaceSearchQuery,
  });

  /**
   * 3. 캐시 및 로컬 스토리지 동기화
   */
  useEffect(() => {
    const updateCreatedRecordPins = () => {
      const stored = getStoredRecordPins();
      setCreatedRecordPins(
        stored.map((storedPin) => ({
          record: storedPin.record,
          coordinates: storedPin.coordinates,
        })),
      );
    };

    updateCreatedRecordPins();

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const queryKey: unknown = event?.query?.queryKey;
      if (
        event?.type === 'updated' &&
        Array.isArray(queryKey) &&
        queryKey.length > 0 &&
        queryKey[0] === 'records' &&
        event.query.state.status === 'success'
      ) {
        updateCreatedRecordPins();
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  /**
   * 4. 연결 기록 수신 (Navigation State)
   */
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.connectedRecords) {
      setConnectedRecords({
        fromId: state.connectedRecords.fromId,
        toId: state.connectedRecords.toId,
      });
      void navigate(location.pathname, { replace: true, state: {} });

      const timer = setTimeout(() => setConnectedRecords(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  /** 핸들러 */
  const handleRecordClick = (recordId: string) => {
    void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
  };

  const handleRecordSelect = (recordId: string | null) => {
    setSelectedRecordId(recordId);
  };

  const handleOpenFullDetail = (recordId: string) => {
    void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
  };

  const handleStartConnection = (recordId: string) => {
    startConnection(recordId);
  };

  const handleConnectionComplete = (
    fromRecordId: string,
    toRecordId: string,
  ) => {
    setConnectedRecords({
      fromId: fromRecordId,
      toId: toRecordId,
    });
    cancelConnection();

    // 3초 후 연결 표시 제거
    const timer = setTimeout(() => setConnectedRecords(null), 3000);
    return () => clearTimeout(timer);
  };

  const handleConnectionCancel = () => {
    cancelConnection();
  };

  const handleSettingsClick = () => {
    void navigate(ROUTES.SETTINGS);
  };

  const handleFilterReset = () => {
    setSortOrder('newest');
    setStartDate('');
    setEndDate('');
  };

  const handleRecordPinClick = (
    recordId: string,
    meta?: {
      clusterRecordIds?: string[];
      clusterRecords?: Record[];
      singleRecord?: Record;
      coordinates?: { lat: number; lng: number };
    },
  ) => {
    const ids = meta?.clusterRecordIds ?? [recordId];
    setPinSelectedRecordIds(ids);
    // 카드 리스트는 항상 all API 결과만 사용
    setPinSelectedRecordsOverride(null);

    if (ids.length === 1 && meta?.singleRecord?.location && meta?.coordinates) {
      setPinSelectedLocationWithCoords({
        location: meta.singleRecord.location,
        coordinates: meta.coordinates,
      });
      return;
    }

    // 클러스터지만 같은 장소(좌표 공유)인 경우 허용
    if (
      ids.length > 1 &&
      meta?.coordinates &&
      meta?.clusterRecords &&
      meta.clusterRecords.length > 0
    ) {
      setPinSelectedLocationWithCoords({
        location: meta.clusterRecords[0].location,
        coordinates: meta.coordinates,
      });
    } else {
      setPinSelectedLocationWithCoords(null);
    }
  };

  const handleClearPinSelection = () => {
    setPinSelectedRecordIds(null);
    setPinSelectedLocationWithCoords(null);
    setPinSelectedRecordsOverride(null);
  };

  const handleMapPlaceSelect = (address: GeocodeAddress) => {
    setTargetLocation({
      lat: parseFloat(address.latitude),
      lng: parseFloat(address.longitude),
    });
    setMapPlaceSearchQuery('');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FDFCFB]">
      {/* 사이드바 */}
      <DesktopSidebar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRecordClick={handleRecordClick}
        onCreateRecordAtLocation={(loc: Location, coords: Coordinates) => {
          setRecordWriteLocation(loc);
          setRecordWriteCoordinates(coords);
          setIsRecordWriteOpen(true);
        }}
        pinSelectedLocationWithCoords={pinSelectedLocationWithCoords}
        onSettingsClick={handleSettingsClick}
        sortOrder={sortOrder}
        startDate={startDate}
        endDate={endDate}
        onSortOrderChange={setSortOrder}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilterReset={handleFilterReset}
        selectedRecordId={selectedRecordId}
        onRecordSelect={handleRecordSelect}
        onOpenFullDetail={handleOpenFullDetail}
        onStartConnection={handleStartConnection}
        pinSelectedRecordIds={pinSelectedRecordIds}
        pinSelectedRecordsOverride={pinSelectedRecordsOverride}
        onClearPinSelection={handleClearPinSelection}
      />

      {/* 메인 지도 영역 */}
      <main className="flex-1 relative overflow-hidden">
        {/* 지도 배경 패턴 */}
        <div className="absolute inset-0 z-0 bg-[#FDFCFB]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="opacity-[0.05]"
          >
            <path
              d="M0 20 H100 M0 50 H100 M0 80 H100 M20 0 V100 M50 0 V100 M80 0 V100"
              stroke="#FE8916"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>

        {/* 지도 */}
        <div className="absolute inset-0 z-10">
          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapViewport
              className="w-full h-full"
              createdRecordPins={createdRecordPins}
              connectedRecords={connectedRecords}
              targetLocation={targetLocation}
              onTargetLocationChange={setTargetLocation}
              onRecordPinClick={handleRecordPinClick}
              onCreateRecord={(
                location: Location,
                coordinates?: Coordinates,
              ) => {
                setRecordWriteLocation(location);
                setRecordWriteCoordinates(coordinates);
                setIsRecordWriteOpen(true);
              }}
              renderLocationConfirmation={({
                location: loc,
                onConfirm,
                onCancel,
              }) => (
                <LocationConfirmation
                  location={{ name: loc.name, address: loc.address }}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                />
              )}
            />
          </Suspense>
        </div>

        {/* 지도 우측 상단 장소 검색 (absolute) */}
        <div className="absolute top-4 right-4 z-20 w-[min(400px,calc(100%-2rem))] flex flex-col gap-1 pointer-events-auto">
          <input
            type="search"
            value={mapPlaceSearchQuery}
            onChange={(e) => setMapPlaceSearchQuery(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="장소 검색..."
            aria-label="장소 검색"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white/95 shadow-sm text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
          <SearchResultsPanel
            isOpen={mapPlaceSearchQuery.trim().length > 0}
            isLoading={isGeocoding}
            query={mapPlaceSearchQuery}
            results={geocodeData?.data?.addresses}
            onSelect={handleMapPlaceSelect}
            onClose={() => setMapPlaceSearchQuery('')}
            alignRight
            alignRightOffsetTop="3.25rem"
          />
        </div>
      </main>

      {/* 알림 토스트 영역 */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {showSuccessToast && (
          <ToastErrorMessage
            message="기록이 성공적으로 저장되었습니다"
            variant="success"
          />
        )}
        {isGeocoding && (
          <ToastErrorMessage message="주소를 검색하는 중..." variant="info" />
        )}
        {geocodeError && (
          <ToastErrorMessage
            message="주소를 찾을 수 없습니다."
            variant="error"
          />
        )}
      </div>

      {/* 태그 관리 모달 */}
      <TagManagementModal
        isOpen={isTagManagementModalOpen}
        onClose={() => setIsTagManagementModalOpen(false)}
      />

      {/* 연결 모드 Drawer */}
      {connectionFromRecordId && (
        <RecordConnectionDrawer
          isOpen={true}
          onClose={handleConnectionCancel}
          fromRecordId={connectionFromRecordId}
          onConnect={handleConnectionComplete}
        />
      )}

      {/* 기록 작성 페이지 오버레이 */}
      {isRecordWriteOpen && recordWriteLocation && (
        <RecordWritePageDesktop
          initialLocation={recordWriteLocation}
          initialCoordinates={recordWriteCoordinates}
          onSave={(record, coordinates) => {
            setIsRecordWriteOpen(false);
            setRecordWriteLocation(null);
            setRecordWriteCoordinates(undefined);

            // 데스크톱: 사이드바 기록 요약 패널로 전환
            setSelectedRecordId(record.id);

            // 생성된 기록 핀 추가
            setCreatedRecordPins((prev) => [...prev, { record, coordinates }]);

            // 로컬 스토리지에 저장
            const storedPin: StoredRecordPin = {
              record,
              coordinates,
              publicId: record.id,
            };
            addStoredRecordPin(storedPin);

            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
          }}
          onCancel={() => {
            setIsRecordWriteOpen(false);
            setRecordWriteLocation(null);
            setRecordWriteCoordinates(undefined);
          }}
        />
      )}
    </div>
  );
}
