import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChip from '@/shared/ui/category/CategoryChip';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import MapLoadingSkeleton from '@/shared/ui/loading/MapLoadingSkeleton';
import { useGetTags } from '@/features/record/hooks/useGetTags';
import ActionSheet from '@/shared/ui/dialog/ActionSheet';
import TagManagementModal from '@/features/record/ui/TagManagementModal';
import { useAuthStore } from '@/features/auth/domain/authStore';

// 지도 컴포넌트를 동적 임포트
const MapViewport = lazy(() => import('./MapViewport'));
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';
import type { Record, Coordinates } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';
import { ROUTES } from '@/router/routes';
import {
  getStoredRecordPins,
  addStoredRecordPin,
} from '@/infra/storage/recordStorage';
import type { StoredRecordPin } from '@/infra/types/storage';
import { useGeocodeSearch } from '@/features/home/hooks/useGeocodeSearch';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteRecord } from '@/features/record/hooks/useDeleteRecord';

export default function MainMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] =
    useState(false);
  const logout = useAuthStore((state) => state.logout);

  // 알림 상태 관리
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);

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
    address: searchValue,
    setAddress: setSearchValue,
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

  const handleSearchClick = () => setIsSearchActive(true);

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchValue('');
    setTargetLocation(null);
  };

  const { handleTabChange } = useBottomTabNavigation();

  const handleSettingsClick = () => {
    setIsActionSheetOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    void navigate(ROUTES.LOGIN);
  };

  const handleTagManagementClick = () => {
    setIsActionSheetOpen(false);
    setIsTagManagementModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      <AppHeader
        onTitleClick={() => void navigate(ROUTES.HOME)}
        onSearchClick={handleSearchClick}
        onSettingsClick={handleSettingsClick}
        isSearchActive={isSearchActive}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchCancel={handleSearchCancel}
        onSearch={(value) => setSearchValue(value)}
      />

      <MainMapTags />

      <Suspense fallback={<MapLoadingSkeleton />}>
        <MapViewport
          createdRecordPins={createdRecordPins}
          connectedRecords={connectedRecords}
          targetLocation={targetLocation}
          onTargetLocationChange={setTargetLocation}
        />
      </Suspense>

      <BottomTabBar activeTab="home" onTabChange={handleTabChange} />

      {/* 알림 토스트 영역 */}
      <div className="absolute top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
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

      {/* 설정 ActionSheet */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        items={[
          {
            label: '태그 관리',
            onClick: handleTagManagementClick,
            variant: 'default',
          },
          {
            label: '로그아웃',
            onClick: () => void handleLogout(),
            variant: 'danger',
          },
        ]}
      />

      {/* 태그 관리 모달 */}
      <TagManagementModal
        isOpen={isTagManagementModalOpen}
        onClose={() => setIsTagManagementModalOpen(false)}
      />
    </div>
  );
}

function MainMapTags() {
  const { data: allTags = [] } = useGetTags();

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {allTags.map((tag) => (
        <CategoryChip
          key={tag.publicId}
          label={tag.name}
          isSelected={false}
          onClick={() => {
            // TODO: 태그 클릭 시 필터링 기능 구현
          }}
        />
      ))}
    </div>
  );
}
