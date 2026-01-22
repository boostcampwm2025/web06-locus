import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import MapLoadingSkeleton from '@/shared/ui/loading/MapLoadingSkeleton';

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

export default function MainMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
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
   * 1. 지오코딩 API 훅 연결
   * useGeocodeSearch 내부에서 searchValue(address)와 300ms 디바운스가 작동.
   */
  const {
    address: searchValue,
    setAddress: setSearchValue,
    data: geocodeData,
    isLoading: isGeocoding,
    error: geocodeError,
  } = useGeocodeSearch('');

  /**
   * 2. 지오코딩 결과 발생 시 지도 중심 이동
   */
  useEffect(() => {
    const firstAddr = geocodeData?.data?.addresses?.[0];
    if (firstAddr) {
      setTargetLocation({
        lat: parseFloat(firstAddr.latitude),
        lng: parseFloat(firstAddr.longitude),
      });
      // 검색 결과가 반영되면 검색 모드를 끄거나 유지할 수 있음.
      // setIsSearchActive(false);
    }
  }, [geocodeData]);

  /**
   * 3. localStorage 및 캐시 무효화 동기화 로직
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
        typeof queryKey[0] === 'string' &&
        queryKey[0] === 'records' &&
        event.query.state.status === 'success'
      ) {
        updateCreatedRecordPins();
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  /**
   * 4. location.state 처리 (저장 완료 후 진입 시)
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

  /** 이벤트 핸들러 */
  const handleDetailSheetClose = () => {
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

  const handleSearchClick = () => setIsSearchActive(true);

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchValue(''); // 훅 내부 address 초기화
    setTargetLocation(null);
  };

  const { handleTabChange } = useBottomTabNavigation();

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      <AppHeader
        onTitleClick={() => void navigate(ROUTES.HOME)}
        onSearchClick={handleSearchClick}
        isSearchActive={isSearchActive}
        searchValue={searchValue}
        onSearchChange={setSearchValue} // 훅의 setAddress와 직접 연결
        onSearchCancel={handleSearchCancel}
        onSearch={(value) => setSearchValue(value)} // 엔터 시 즉시 업데이트
      />

      <CategoryChips />

      <Suspense fallback={<MapLoadingSkeleton />}>
        <MapViewport
          createdRecordPins={createdRecordPins}
          connectedRecords={connectedRecords}
          targetLocation={targetLocation}
          onTargetLocationChange={setTargetLocation}
        />
      </Suspense>

      <BottomTabBar activeTab="home" onTabChange={handleTabChange} />

      {/* --- 토스트 메시지 영역 (겹침 방지를 위해 flex-col 처리) --- */}
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
          onEdit={() => setIsDetailSheetOpen(false)}
          onDelete={() => {
            setIsDetailSheetOpen(false);
            setSavedRecord(null);
          }}
        />
      )}
    </div>
  );
}
