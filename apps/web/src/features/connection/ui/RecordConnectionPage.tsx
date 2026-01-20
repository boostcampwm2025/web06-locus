import { useMemo } from 'react';
import { ArrowLeftIcon } from '@/shared/icons';
import type {
  RecordConnectionPageProps,
  RecordConnectionItem,
} from '../types/recordConnection';
import { useRecordConnection } from '../domain/useRecordConnection';
import { useCreateConnection } from '../hooks/useCreateConnection';
import { convertMockRecordsToConnectionItems } from '@/features/record/domain/record.mock';
import RecordSelectionHeader from './RecordSelectionHeader';
import RecordSearchInput from './RecordSearchInput';
import RecommendedRecordsSection from './RecommendedRecordsSection';
import ConnectActionButton from './ConnectActionButton';
import RecordSelectionContextSheet from './RecordSelectionContextSheet';

export default function RecordConnectionPage({
  onBack,
  onConnect,
  className = '',
}: RecordConnectionPageProps) {
  const {
    departure,
    arrival,
    searchQuery,
    isConnectEnabled,
    pendingRecord,
    selectDeparture,
    selectArrival,
    clearDeparture,
    clearArrival,
    handleRecordClick,
    closeContextMenu,
    updateSearchQuery,
    connect,
  } = useRecordConnection();

  // 연결 생성 mutation
  const createConnectionMutation = useCreateConnection();

  // mock 데이터 사용 (기록 조회 API가 없으므로)
  const trimmedQuery = searchQuery.trim();
  const recordsWithRelatedTag = useMemo<RecordConnectionItem[]>(() => {
    return convertMockRecordsToConnectionItems(trimmedQuery || undefined);
  }, [trimmedQuery]);

  const emptyMessage = trimmedQuery
    ? '검색 결과가 없습니다'
    : '추천 기록이 없습니다';

  const handleConnect = async () => {
    if (!isConnectEnabled) return;

    const result = connect();
    if (!result) return;

    try {
      // API로 연결 생성
      const response = await createConnectionMutation.mutateAsync({
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
      });

      // 성공 시 localStorage에도 저장
      const { addStoredConnection } = await import(
        '@/infra/storage/connectionStorage'
      );
      addStoredConnection({
        publicId: response.data.connection.publicId,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: response.data.connection.createdAt,
      });

      // 성공 시 콜백 호출
      onConnect?.(result.departureId, result.arrivalId);
    } catch (error) {
      // API 실패 시에도 localStorage에 저장하여 시연 가능하도록
      console.error('연결 생성 실패 (로컬 저장으로 대체):', error);

      const { addStoredConnection } = await import(
        '@/infra/storage/connectionStorage'
      );
      addStoredConnection({
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: new Date().toISOString(),
      });

      // 시각적으로 연결 표시를 위해 콜백 호출
      onConnect?.(result.departureId, result.arrivalId);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          연결할 기록 선택
        </h1>
      </header>

      {/* 출발/도착 선택 영역 */}
      <RecordSelectionHeader
        departure={departure}
        arrival={arrival}
        onDepartureClick={() => {
          // 재선택 UX: 현재 선택 상태가 있으면 컨텍스트 시트를 열도록 유도
          // - 실제로는 “출발만 다시 고르기 모드” 같은 UX로 확장 가능
        }}
        onArrivalClick={() => {
          // 재선택 UX: 필요하면 여기에 “도착 재선택” 모드 구현
        }}
        onDepartureClear={clearDeparture}
        onArrivalClear={clearArrival}
      />

      {/* 검색 입력 */}
      <div className="px-4 py-3 bg-white">
        <RecordSearchInput
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          placeholder="기록 제목, 태그, 장소 검색..."
        />
      </div>

      {/* 추천 기록 섹션 + 스크롤 */}
      <RecommendedRecordsSection
        title="추천 기록"
        description={
          searchQuery.trim() ? '검색 결과' : '동일한 태그 또는 인접한 장소'
        }
        records={recordsWithRelatedTag}
        onRecordClick={handleRecordClick}
        emptyMessage={emptyMessage}
        scrollHeight="flex-1"
        className="flex-1 flex flex-col min-h-0 pb-24"
      />

      {/* 연결하기 버튼 */}
      <ConnectActionButton
        isEnabled={isConnectEnabled && !createConnectionMutation.isPending}
        onClick={() => {
          void handleConnect();
        }}
      />

      {/* 기록 선택 컨텍스트 메뉴 */}
      <RecordSelectionContextSheet
        isOpen={!!pendingRecord}
        onClose={closeContextMenu}
        record={pendingRecord}
        onSelectDeparture={selectDeparture}
        onSelectArrival={selectArrival}
      />
    </div>
  );
}
