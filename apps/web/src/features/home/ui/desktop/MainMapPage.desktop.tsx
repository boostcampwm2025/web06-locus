import { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DesktopSidebar } from '@/shared/ui/desktop';
import MapLoadingSkeleton from '@/shared/ui/loading/MapLoadingSkeleton';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import TagManagementModal from '@/features/record/ui/TagManagementModal';
import RecordConnectionDrawer from '@/features/connection/ui/desktop/RecordConnectionDrawer';
import { useConnectionStore } from '@/features/connection/domain/connectionStore';
import { useDeleteRecord } from '@/features/record/hooks/useDeleteRecord';
import { useGeocodeSearch } from '@/features/home/hooks/useGeocodeSearch';
import { ROUTES } from '@/router/routes';
import {
  getStoredRecordPins,
  addStoredRecordPin,
} from '@/infra/storage/recordStorage';
import type { Record, Coordinates } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';
import type { StoredRecordPin } from '@/infra/types/storage';
import MapViewport from '../MapViewport';

export function MainMapPageDesktop() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] =
    useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

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

  /**
   * 1. 지오코딩 API 훅
   */
  const {
    data: geocodeData,
    isLoading: isGeocoding,
    error: geocodeError,
  } = useGeocodeSearch('');

  /**
   * 2. 검색 결과에 따른 지도 중심 이동
   */
  useEffect(() => {
    const firstAddr = geocodeData?.data?.addresses?.[0];
    if (firstAddr) {
      setTargetLocation({
        lat: parseFloat(firstAddr.latitude),
        lng: parseFloat(firstAddr.longitude),
      });
    }
  }, [geocodeData]);

  /**
   * 3. 기록 삭제 훅
   */
  const deleteRecordMutation = useDeleteRecord();

  /**
   * 4. 캐시 및 로컬 스토리지 동기화
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
   * 5. 생성 직후 데이터 수신 (Navigation State)
   */
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.savedRecord) {
      const newRecord: Record = {
        id: state.savedRecord.id,
        text: state.savedRecord.text,
        tags: state.savedRecord.tags,
        location: state.savedRecord.location,
        createdAt: state.savedRecord.createdAt,
      };

      setSavedRecord(newRecord);
      setIsDetailSheetOpen(true);

      setCreatedRecordPins((prev) => [
        ...prev,
        { record: newRecord, coordinates: state.savedRecord?.coordinates },
      ]);

      const storedPin: StoredRecordPin = {
        record: newRecord,
        coordinates: state.savedRecord.coordinates,
        publicId: newRecord.id,
      };
      addStoredRecordPin(storedPin);

      setShowSuccessToast(true);
      void navigate(location.pathname, { replace: true, state: {} });

      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }

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
  const handleDetailSheetClose = () => {
    if (deleteRecordMutation.isPending) return; // 삭제 중엔 닫기 방지
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

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

  const handleCreateRecordClick = () => {
    void navigate(ROUTES.RECORD);
  };

  const handleSettingsClick = () => {
    void navigate(ROUTES.SETTINGS);
  };

  const handleFilterReset = () => {
    setSortOrder('newest');
    setStartDate('');
    setEndDate('');
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
        onCreateRecordClick={handleCreateRecordClick}
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
            />
          </Suspense>
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
        {showDeleteErrorToast && (
          <ToastErrorMessage
            message="기록 삭제에 실패했습니다."
            variant="error"
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

      {/* 기록 요약 바텀시트 */}
      {savedRecord && (
        <RecordSummaryBottomSheet
          isOpen={isDetailSheetOpen}
          onClose={handleDetailSheetClose}
          record={savedRecord}
          isDeleting={deleteRecordMutation.isPending}
          onEdit={() => setIsDetailSheetOpen(false)}
          onDelete={() => {
            if (savedRecord?.id) {
              deleteRecordMutation.mutate(savedRecord.id, {
                onSuccess: () => {
                  setCreatedRecordPins((prev) =>
                    prev.filter((pin) => pin.record.id !== savedRecord.id),
                  );
                  setIsDetailSheetOpen(false);
                  setSavedRecord(null);
                },
                onError: () => {
                  setShowDeleteErrorToast(true);
                  setTimeout(() => setShowDeleteErrorToast(false), 3000);
                },
              });
            }
          }}
        />
      )}

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
    </div>
  );
}
