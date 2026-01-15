import { useMemo } from 'react';
import { ArrowLeftIcon } from '@/shared/icons';
import type {
  RecordConnectionPageProps,
  RecordConnectionItem,
} from '../types/recordConnection';
import { useRecordConnection } from '../domain/useRecordConnection';
import RecordSelectionHeader from './RecordSelectionHeader';
import RecordSearchInput from './RecordSearchInput';
import RecommendedRecordsSection from './RecommendedRecordsSection';
import ConnectActionButton from './ConnectActionButton';
import RecordSelectionContextSheet from './RecordSelectionContextSheet';

// TODO: 실제 API로 교체 필요
const mockRecommendedRecords: RecordConnectionItem[] = [
  {
    id: '1',
    title: '남산타워 전망',
    location: { name: '남산', address: '서울특별시 용산구 남산공원길' },
    date: new Date('2025-12-15'),
    tags: ['명소', '자연'],
    imageUrl: 'https://placehold.co/80',
    isRelated: false,
  },
  {
    id: '2',
    title: '강남 카페거리',
    location: { name: '강남역', address: '서울특별시 강남구 강남대로' },
    date: new Date('2025-12-14'),
    tags: ['쇼핑', '음식'],
    imageUrl: 'https://placehold.co/80',
    isRelated: false,
  },
  {
    id: '3',
    title: '광화문 광장',
    location: { name: '광화문', address: '서울특별시 종로구 세종대로' },
    date: new Date('2025-12-13'),
    tags: ['역사', '문화'],
    isRelated: false,
  },
  {
    id: '4',
    title: '이태원 맛집',
    location: { name: '이태원', address: '서울특별시 용산구 이태원로' },
    date: new Date('2025-12-12'),
    tags: ['음식', '문화'],
    imageUrl: 'https://placehold.co/80',
    isRelated: false,
  },
];

/**
 * 기록 연결 페이지 컴포넌트
 */
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

  /**
   * 검색 결과 필터링 + related 플래그
   * - 데이터가 커질 수 있으니 useMemo로 감싸서 불필요 연산 방지
   */
  const recordsWithRelatedTag = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return mockRecommendedRecords;

    const query = trimmed.toLowerCase();
    const filtered = mockRecommendedRecords.filter((record) => {
      return (
        record.title.toLowerCase().includes(query) ||
        record.location.name.toLowerCase().includes(query) ||
        record.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return filtered.map((record) => ({
      ...record,
      isRelated: true,
    }));
  }, [searchQuery]);

  const emptyMessage = searchQuery.trim()
    ? '검색 결과가 없습니다'
    : '추천 기록이 없습니다';

  const handleConnect = () => {
    if (!isConnectEnabled) return;

    const result = connect();
    if (!result) return;

    onConnect?.(result.departureId, result.arrivalId);
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
          // ✅ 재선택 UX: 현재 선택 상태가 있으면 컨텍스트 시트를 열도록 유도
          // - 실제로는 “출발만 다시 고르기 모드” 같은 UX로 확장 가능
        }}
        onArrivalClick={() => {
          // ✅ 재선택 UX: 필요하면 여기에 “도착 재선택” 모드 구현
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
        isEnabled={isConnectEnabled}
        onClick={handleConnect}
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
