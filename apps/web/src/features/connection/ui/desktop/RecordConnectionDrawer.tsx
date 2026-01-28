import { useMemo, useState, useEffect } from 'react';
import { useConnectionStore } from '../../domain/connectionStore';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { useRecordGraph } from '../../hooks/useRecordGraph';
import { useGetRecordDetail } from '@/features/record/hooks/useGetRecordDetail';
import { useCreateConnection } from '../../hooks/useCreateConnection';
import type { Record as ApiRecord } from '@locus/shared';
import type { RecordConnectionItem } from '../../types/recordConnection';
import type { RecordConnectionDrawerProps } from '@/features/record/types/record';
import RecordSearchInput from '../RecordSearchInput';
import RecommendedRecordsSection from '../RecommendedRecordsSection';
import RecordSelectionContextSheet from '../RecordSelectionContextSheet';
import ConnectionConfirmDialog from './ConnectionConfirmDialog';
import ConnectionHeader from './ConnectionHeader';

// 한국 전체를 커버하는 넓은 bounds
const KOREA_WIDE_BOUNDS = {
  neLat: 38.6,
  neLng: 131.9,
  swLat: 33.1,
  swLng: 124.6,
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

/**
 * 데스크톱용 연결 기록 선택 컴포넌트
 * DesktopUI 디자인: 상단 고정 헤더 + 메인 화면 유지
 */
export default function RecordConnectionDrawer({
  isOpen,
  onClose,
  fromRecordId,
  onConnect,
}: RecordConnectionDrawerProps) {
  const departure = useConnectionStore((state) => state.departure);
  const arrival = useConnectionStore((state) => state.arrival);
  const searchQuery = useConnectionStore((state) => state.searchQuery);
  const pendingRecord = useConnectionStore((state) => state.pendingRecord);
  const selectDeparture = useConnectionStore((state) => state.selectDeparture);
  const selectArrival = useConnectionStore((state) => state.selectArrival);
  const clearArrival = useConnectionStore((state) => state.clearArrival);
  const closeContextMenu = useConnectionStore(
    (state) => state.closeContextMenu,
  );
  const connect = useConnectionStore((state) => state.connect);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // 출발 기록 상세 조회
  const { data: fromRecordDetail } = useGetRecordDetail(fromRecordId, {
    enabled: isOpen && !!fromRecordId,
  });

  // 출발 기록이 로드되면 자동으로 선택
  useEffect(() => {
    if (fromRecordDetail && !departure) {
      selectDeparture({
        id: fromRecordDetail.publicId,
        title: fromRecordDetail.title,
        location: {
          name: fromRecordDetail.location.name ?? '',
          address: fromRecordDetail.location.address ?? '',
        },
        date: new Date(fromRecordDetail.createdAt),
        tags: fromRecordDetail.tags?.map((tag) => tag.name) ?? [],
        imageUrl:
          fromRecordDetail.images && fromRecordDetail.images.length > 0
            ? fromRecordDetail.images[0].medium.url
            : undefined,
      });
    }
  }, [fromRecordDetail, departure, selectDeparture]);

  // 도착 기록이 선택되면 자동으로 확인 다이얼로그 열기
  useEffect(() => {
    if (departure && arrival && !showConfirmDialog) {
      setShowConfirmDialog(true);
    }
  }, [departure, arrival, showConfirmDialog]);

  // 연결 생성 mutation
  const createConnectionMutation = useCreateConnection();

  // 바운딩 박스 기반 전체 기록 조회
  const { data: recordsByBoundsData } =
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

    if (departureGraphData?.data?.edges && departure?.id) {
      departureGraphData.data.edges.forEach((edge) => {
        if (edge.fromRecordPublicId === departure.id) {
          connectedIds.add(edge.toRecordPublicId);
        } else if (edge.toRecordPublicId === departure.id) {
          connectedIds.add(edge.fromRecordPublicId);
        }
      });
    }

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

  // API 응답을 RecordConnectionItem으로 변환 (ConnectionModeRecordList에서 사용 가능)
  const trimmedQuery = searchQuery.trim();
  const records = useMemo<RecordConnectionItem[]>(() => {
    if (!recordsByBoundsData?.records) {
      return [];
    }

    const filteredRecords = trimmedQuery
      ? recordsByBoundsData.records.filter((record: ApiRecord) => {
          const query = trimmedQuery.toLowerCase();
          const isTitleMatch = record.title.toLowerCase().includes(query);
          const isLocationNameMatch =
            record.location.name?.toLowerCase().includes(query) ?? false;
          const isAddressMatch =
            record.location.address?.toLowerCase().includes(query) ?? false;
          const isTagMatch = record.tags.some((tag) =>
            tag.toLowerCase().includes(query),
          );

          return (
            isTitleMatch || isLocationNameMatch || isAddressMatch || isTagMatch
          );
        })
      : recordsByBoundsData.records;

    return filteredRecords
      .filter((record: ApiRecord) => record.publicId !== fromRecordId) // 출발 기록 제외
      .map((record: ApiRecord) => {
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
          tags: record.tags,
          isRelated: Boolean(trimmedQuery),
          isConnected: connectedRecordIds.has(record.publicId),
          imageUrl: thumbnailUrl,
        };
      });
  }, [recordsByBoundsData, trimmedQuery, connectedRecordIds, fromRecordId]);

  const handleConfirmConnect = async () => {
    const result = connect();
    if (!result) return;

    setIsConnecting(true);
    try {
      const response = await createConnectionMutation.mutateAsync({
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
      });

      const { addStoredConnection } = await import(
        '@/infra/storage/connectionStorage'
      );
      addStoredConnection({
        publicId: response.data.connection.publicId,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: response.data.connection.createdAt,
      });

      onConnect(result.departureId, result.arrivalId);
      setShowConfirmDialog(false);
      onClose();
    } catch (error) {
      console.error('연결 생성 실패:', error);
      const { addStoredConnection } = await import(
        '@/infra/storage/connectionStorage'
      );
      addStoredConnection({
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: new Date().toISOString(),
      });

      onConnect(result.departureId, result.arrivalId);
      setShowConfirmDialog(false);
      onClose();
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 상단 고정 헤더 */}
      <ConnectionHeader
        fromRecord={
          departure
            ? {
                id: departure.id,
                title: departure.title,
                location: departure.location,
              }
            : null
        }
        onCancel={onClose}
      />

      {/* 연결 확인 다이얼로그 */}
      {departure && arrival && (
        <ConnectionConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            // 다이얼로그를 닫을 때 arrival 상태 초기화하여 다시 자동으로 열리지 않도록 함
            clearArrival();
          }}
          departure={{
            id: departure.id,
            title: departure.title,
            location: departure.location,
            imageUrl: records.find((r) => r.id === departure.id)?.imageUrl,
          }}
          arrival={{
            id: arrival.id,
            title: arrival.title,
            location: arrival.location,
            imageUrl: records.find((r) => r.id === arrival.id)?.imageUrl,
          }}
          onConfirm={() => {
            void handleConfirmConnect();
          }}
          isConnecting={isConnecting}
        />
      )}

      {/* 기록 선택 컨텍스트 메뉴 */}
      <RecordSelectionContextSheet
        isOpen={!!pendingRecord}
        onClose={closeContextMenu}
        record={pendingRecord}
        onSelectDeparture={selectDeparture}
        onSelectArrival={selectArrival}
      />
    </>
  );
}

/**
 * 연결 모드에서 표시할 기록 목록 컴포넌트
 * DesktopSidebar 내부에 표시됩니다.
 *
 * Note: 이 컴포넌트는 DesktopSidebar에서 직접 구현되어 사용됩니다.
 * 연결 모드 UI(오버레이 아이콘, 연결하기 버튼)를 지원하기 위해
 * DesktopSidebar의 RecordCard를 사용합니다.
 */
export function ConnectionModeRecordList({
  searchQuery,
  onSearchChange,
  records: recordsProp,
  onRecordClick,
  emptyMessage,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  records: RecordConnectionItem[];
  onRecordClick: (record: RecordConnectionItem) => void;
  emptyMessage: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* 검색 입력 */}
      <div className="px-6 py-3 bg-white shrink-0 border-b border-gray-100">
        <RecordSearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="기록 제목, 태그, 장소 검색..."
        />
      </div>

      {/* 추천 기록 섹션 */}
      <RecommendedRecordsSection
        title="추천 기록"
        description="동일한 태그 또는 인접한 장소"
        records={recordsProp}
        onRecordClick={onRecordClick}
        emptyMessage={emptyMessage}
        scrollHeight="flex-1"
        className="flex-1 flex flex-col min-h-0"
      />
    </div>
  );
}
