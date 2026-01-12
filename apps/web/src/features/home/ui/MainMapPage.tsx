import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import MapViewport from './MapViewport';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import RecordSummaryBottomSheet from '@/features/record/ui/RecordSummaryBottomSheet';
import type { Record } from '@/features/record/types';
import type { MainMapPageLocationState } from '@features/home/types/mainMapPage';

export default function MainMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  // location.state에서 저장된 record 확인
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.savedRecord) {
      setSavedRecord(state.savedRecord);
      setIsDetailSheetOpen(true);
      // state를 초기화하여 뒤로가기 시 다시 표시되지 않도록
      void navigate(location.pathname, { replace: true, state: {} });
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

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <AppHeader />
      <CategoryChips />
      <MapViewport />
      <BottomTabBar activeTab="home" />

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
