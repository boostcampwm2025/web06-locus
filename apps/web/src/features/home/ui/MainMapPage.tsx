import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import MapViewport from './MapViewport';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';
import type { Record, Coordinates } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';
import { ROUTES } from '@/router/routes';

export default function MainMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newRecordPin, setNewRecordPin] = useState<{
    record: Record;
    coordinates?: Coordinates;
  } | null>(null);

  // location.state에서 저장된 record 확인
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.savedRecord) {
      setSavedRecord(state.savedRecord);
      setIsDetailSheetOpen(true);
      const pinData = {
        record: state.savedRecord,
        coordinates: state.savedRecord.coordinates,
      };
      setNewRecordPin(pinData);
      setShowSuccessToast(true);
      // state를 초기화하여 뒤로가기 시 다시 표시되지 않도록
      void navigate(location.pathname, { replace: true, state: {} });

      // 3초 후 토스트 메시지 자동 닫기
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const handleDetailSheetClose = () => {
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

  const handleEdit = () => {
    // TODO: 수정 기능 구현
    setIsDetailSheetOpen(false);
  };

  const handleDelete = () => {
    // TODO: 삭제 기능 구현
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

  const { handleTabChange } = useBottomTabNavigation();

  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchValue('');
  };

  const handleTitleClick = () => {
    void navigate(ROUTES.HOME);
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <AppHeader
        onTitleClick={handleTitleClick}
        onSearchClick={handleSearchClick}
        isSearchActive={isSearchActive}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchCancel={handleSearchCancel}
      />
      <CategoryChips />
      <MapViewport newRecordPin={newRecordPin} />
      <BottomTabBar activeTab="home" onTabChange={handleTabChange} />

      {/* 성공 토스트 메시지 */}
      {showSuccessToast && (
        <div className="absolute top-20 right-4 z-50 animate-fade-in">
          <ToastErrorMessage
            message="기록이 성공적으로 저장되었습니다"
            variant="success"
          />
        </div>
      )}

      {/* 기록 요약 바텀시트 */}
      {savedRecord && (
        <RecordSummaryBottomSheet
          isOpen={isDetailSheetOpen}
          onClose={handleDetailSheetClose}
          record={savedRecord}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
