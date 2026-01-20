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
import {
  getStoredRecordPins,
  addStoredRecordPin,
} from '@/infra/storage/recordStorage';
import type { StoredRecordPin } from '@/infra/types/storage';

export default function MainMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // 생성된 기록들을 누적해서 관리 (조회 API가 없으므로)
  // localStorage에서 초기 로드
  const [createdRecordPins, setCreatedRecordPins] = useState<
    {
      record: Record;
      coordinates?: Coordinates;
    }[]
  >(() => {
    // localStorage에서 불러오기
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

  // location.state에서 저장된 record 또는 연결된 기록 확인
  useEffect(() => {
    const state = location.state as MainMapPageLocationState | null;

    if (state?.savedRecord) {
      const savedRecord: Record = {
        id: state.savedRecord.id,
        text: state.savedRecord.text,
        tags: state.savedRecord.tags,
        location: state.savedRecord.location,
        createdAt: state.savedRecord.createdAt,
      };
      setSavedRecord(savedRecord);
      setIsDetailSheetOpen(true);
      const pinData = {
        record: savedRecord,
        coordinates: state.savedRecord.coordinates,
      };
      // 생성된 기록을 배열에 추가 (기존 기록 유지)
      setCreatedRecordPins((prev) => [...prev, pinData]);

      // localStorage에 저장 (publicId 명시적으로 저장)
      const storedPin: StoredRecordPin = {
        record: savedRecord,
        coordinates: state.savedRecord.coordinates,
        publicId: savedRecord.id, // record.id가 publicId
      };
      addStoredRecordPin(storedPin);

      setShowSuccessToast(true);
      // state를 초기화하여 뒤로가기 시 다시 표시되지 않도록
      void navigate(location.pathname, { replace: true, state: {} });

      // 3초 후 토스트 메시지 자동 닫기
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (state?.connectedRecords) {
      const connectedRecords = {
        fromId: state.connectedRecords.fromId,
        toId: state.connectedRecords.toId,
      };
      setConnectedRecords(connectedRecords);
      // state를 초기화하여 뒤로가기 시 다시 표시되지 않도록
      void navigate(location.pathname, { replace: true, state: {} });

      // 3초 후 연결 표시 제거
      const timer = setTimeout(() => {
        setConnectedRecords(null);
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
      <MapViewport
        createdRecordPins={createdRecordPins}
        connectedRecords={connectedRecords}
      />
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
