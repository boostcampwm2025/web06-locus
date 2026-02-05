import { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AppHeader from '@/shared/ui/header/AppHeader';
import { PWAInstallGuide } from '@/shared/ui/pwa';
import CategoryChip from '@/shared/ui/category/CategoryChip';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import MapLoadingSkeleton from '@/shared/ui/loading/MapLoadingSkeleton';
import ActionSheet from '@/shared/ui/dialog/ActionSheet';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import TagManagementModal from '@/features/record/ui/TagManagementModal';
import { useGetTags } from '@/features/record/hooks/useGetTags';
import { useAuthStore } from '@/features/auth/domain/authStore';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';
import { useGeocodeSearch } from '@/features/home/hooks/useGeocodeSearch';
import SearchResultsPanel from '@/features/home/ui/SearchResultsPanel';
import { ROUTES } from '@/router/routes';
import {
  getStoredRecordPins,
  addStoredRecordPin,
} from '@/infra/storage/recordStorage';
import type { Record, Coordinates } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';
import type { StoredRecordPin } from '@/infra/types/storage';
import MapViewport from '../MapViewport';

export function MainMapPageMobile() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [savedRecordCoordinates, setSavedRecordCoordinates] =
    useState<Coordinates | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] =
    useState(false);
  const [showPwaInstallGuide, setShowPwaInstallGuide] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  // 알림 상태 관리
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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
   * 5. 생성 직후 데이터 수신 (Navigation State)
   */
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.savedRecord) {
      // images는 blobPreviewStore에서 관리하므로 여기서는 포함하지 않음
      const newRecord: Record = {
        id: state.savedRecord.id,
        text: state.savedRecord.text,
        tags: state.savedRecord.tags,
        location: state.savedRecord.location,
        createdAt: state.savedRecord.createdAt,
        images: state.savedRecord.images,
      };

      setSavedRecord(newRecord);
      setSavedRecordCoordinates(state.savedRecord.coordinates ?? null);
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
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
    setSavedRecordCoordinates(null);
  };

  const handleSearchClick = () => setIsSearchActive(true);

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchValue('');
    setTargetLocation(null);
  };

  const { handleTabChange } = useBottomTabNavigation();

  const handleSettingsClick = () => {
    void navigate(ROUTES.SETTINGS);
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
        onTitleClick={() => setShowPwaInstallGuide(true)}
        onSearchClick={handleSearchClick}
        onSettingsClick={handleSettingsClick}
        isSearchActive={isSearchActive}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchCancel={handleSearchCancel}
        onSearch={(value) => setSearchValue(value)}
      />

      <SearchResultsPanel
        isOpen={isSearchActive}
        isLoading={isGeocoding}
        query={searchValue}
        results={geocodeData?.data?.addresses}
        onSelect={(addr) => {
          setTargetLocation({
            lat: parseFloat(addr.latitude),
            lng: parseFloat(addr.longitude),
          });
          setIsSearchActive(false);
        }}
        onClose={() => setIsSearchActive(false)}
      />

      <div className="pt-[72px]">
        <MainMapTags navigate={navigate} />
      </div>

      <div className="flex-1 relative pb-[72px] min-h-0">
        <Suspense fallback={<MapLoadingSkeleton />}>
          <MapViewport
            createdRecordPins={createdRecordPins}
            connectedRecords={connectedRecords}
            targetLocation={targetLocation}
            onTargetLocationChange={setTargetLocation}
          />
        </Suspense>
      </div>

      <BottomTabBar activeTab="home" onTabChange={handleTabChange} />

      {/* 알림 토스트 영역 */}
      <div className="absolute top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
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

      {/* 기록 요약 바텀시트 */}
      {savedRecord && (
        <RecordSummaryBottomSheet
          isOpen={isDetailSheetOpen}
          onClose={handleDetailSheetClose}
          record={savedRecord}
          recordCoordinates={savedRecordCoordinates ?? undefined}
          onAddRecord={(locationWithCoords) => {
            handleDetailSheetClose();
            void navigate(ROUTES.RECORD, {
              state: {
                location: {
                  name: locationWithCoords.name,
                  address: locationWithCoords.address,
                  coordinates: locationWithCoords.coordinates,
                },
              },
            });
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

      {/* PWA 설치 가이드 (헤더 가운데 Locus 제목 클릭 시) */}
      <PWAInstallGuide
        isOpen={showPwaInstallGuide}
        onClose={() => setShowPwaInstallGuide(false)}
      />
    </div>
  );
}

function MainMapTags({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { data: allTags = [] } = useGetTags();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const handleTagClick = (tagPublicId: string) => {
    if (selectedTagId === tagPublicId) {
      // 같은 태그 클릭 시 선택 해제
      setSelectedTagId(null);
      // 기록 목록으로 이동 (필터 없음)
      void navigate(ROUTES.RECORD_LIST);
    } else {
      // 다른 태그 선택
      setSelectedTagId(tagPublicId);
      // 기록 목록으로 이동 (태그 필터 적용)
      void navigate(ROUTES.RECORD_LIST, {
        state: { selectedCategory: tagPublicId },
      });
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {allTags.map((tag) => (
        <CategoryChip
          key={tag.publicId}
          label={tag.name}
          isSelected={selectedTagId === tag.publicId}
          onClick={() => handleTagClick(tag.publicId)}
        />
      ))}
    </div>
  );
}
