import { useMemo } from 'react';
import { ChevronLeftIcon } from '@/shared/ui/icons/ChevronLeftIcon';
import type {
  RecordConnectionPageProps,
  RecordConnectionItem,
} from '../types/recordConnection';
import { useRecordConnection } from '../domain/useRecordConnection';
import { useCreateConnection } from '../hooks/useCreateConnection';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import type { Record as ApiRecord } from '@locus/shared';
import RecordSelectionHeader from './RecordSelectionHeader';
import RecordSearchInput from './RecordSearchInput';
import RecommendedRecordsSection from './RecommendedRecordsSection';
import ConnectActionButton from './ConnectActionButton';
import RecordSelectionContextSheet from './RecordSelectionContextSheet';
import { extractTagNames } from '@/shared/utils/tagUtils';

// 한국 전체를 커버하는 넓은 bounds (전체 기록 조회용)
const KOREA_WIDE_BOUNDS = {
  neLat: 38.6, // 북한 포함
  neLng: 131.9, // 동해
  swLat: 33.1, // 제주도 남쪽
  swLng: 124.6, // 서해
  page: 1,
  limit: 100, // 충분히 많은 기록 가져오기
  sortOrder: 'desc' as const,
};

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

  // 바운딩 박스 기반 전체 기록 조회
  const { data: recordsByBoundsData, isLoading: isLoadingRecords } =
    useGetRecordsByBounds(KOREA_WIDE_BOUNDS);

  // 출발 기록의 연결 그래프 조회
  const { data: departureGraphData } = useRecordGraph(departure?.id ?? null, {
    enabled: !!departure?.id,
  });

  // 도착 기록의 연결 그래프 조회
  const { data: arrivalGraphData } = useRecordGraph(arrival?.id ?? null, {
    enabled: !!arrival?.id,
  });

  // 연결된 기록 ID 집합 생성
  const connectedRecordIds = useMemo(() => {
    const connectedIds = new Set<string>();

    // 출발 기록과 연결된 기록들
    if (departureGraphData?.data?.edges && departure?.id) {
      departureGraphData.data.edges.forEach((edge) => {
        if (edge.fromRecordPublicId === departure.id) {
          connectedIds.add(edge.toRecordPublicId);
        } else if (edge.toRecordPublicId === departure.id) {
          connectedIds.add(edge.fromRecordPublicId);
        }
      });
    }

    // 도착 기록과 연결된 기록들
    if (arrivalGraphData?.data?.edges && arrival?.id) {
      arrivalGraphData.data.edges.forEach((edge) => {
        if (edge.fromRecordPublicId === arrival.id) {
          connectedIds.add(edge.toRecordPublicId);
        } else if (edge.toRecordPublicId === arrival.id) {
          connectedIds.add(edge.fromRecordPublicId);
        }
      });
    }

    return connectedIds;
  }, [
    departureGraphData?.data?.edges,
    arrivalGraphData?.data?.edges,
    departure?.id,
    arrival?.id,
  ]);

  // API 응답을 RecordConnectionItem으로 변환
  const trimmedQuery = searchQuery.trim();
  const recordsWithRelatedTag = useMemo<RecordConnectionItem[]>(() => {
    if (!recordsByBoundsData?.records) {
      return [];
    }

    // 검색어가 있으면 필터링, 없으면 전체 표시
    const filteredRecords = trimmedQuery
      ? recordsByBoundsData.records.filter((record: ApiRecord) => {
          const query = trimmedQuery.toLowerCase();
          const isTitleMatch = record.title.toLowerCase().includes(query);
          const isLocationNameMatch =
            record.location.name?.toLowerCase().includes(query) ?? false;
          const isAddressMatch =
            record.location.address?.toLowerCase().includes(query) ?? false;
          const isTagMatch = extractTagNames(record.tags).some((tag) =>
            tag.toLowerCase().includes(query),
          );

          return (
            isTitleMatch || isLocationNameMatch || isAddressMatch || isTagMatch
          );
        })
      : recordsByBoundsData.records;

    return filteredRecords.map((record: ApiRecord) => {
      // 이미지가 있는 경우 첫 번째 이미지의 thumbnail URL 사용 (목록이므로)
      const recordWithImages = record as ApiRecord & {
        images?: {
          thumbnail: { url: string };
          medium: { url: string };
          original: { url: string };
        }[];
      };
      const thumbnailUrl =
        recordWithImages.images && recordWithImages.images.length > 0
          ? recordWithImages.images[0].thumbnail.url
          : undefined;

      return {
        id: record.publicId,
        title: record.title,
        location: {
          name: record.location.name ?? '',
          address: record.location.address ?? '',
        },
        date: new Date(record.createdAt),
        tags: extractTagNames(record.tags),
        isRelated: Boolean(trimmedQuery), // 검색어가 있으면 관련 기록으로 표시
        isConnected: connectedRecordIds.has(record.publicId), // 이미 연결된 기록인지 여부
        imageUrl: thumbnailUrl,
      };
    });
  }, [recordsByBoundsData, trimmedQuery, connectedRecordIds]);

  const emptyMessage = isLoadingRecords
    ? '기록을 불러오는 중...'
    : trimmedQuery
      ? '검색 결과가 없습니다'
      : '기록이 없습니다';

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
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
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
