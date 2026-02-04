import { useMemo, useEffect } from 'react';
import { useConnectionStore } from '../domain/connectionStore';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { useRecordGraph } from '../hooks/useRecordGraph';
import { useGetRecordDetail } from '@/features/record/hooks/useGetRecordDetail';
import type { Record as ApiRecord } from '@locus/shared';
import type { RecordConnectionItem } from '../types/recordConnection';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import { extractTagNames } from '@/shared/utils/tagUtils';

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
 * 연결 모드 데이터를 제공하는 훅
 * DesktopSidebar에서 연결 모드일 때 필요한 데이터를 계산
 */
export function useConnectionModeData() {
  const connectionFromRecordId = useConnectionStore(
    (state) => state.connectionFromRecordId,
  );
  const departure = useConnectionStore((state) => state.departure);
  const arrival = useConnectionStore((state) => state.arrival);
  const searchQuery = useConnectionStore((state) => state.searchQuery);
  const selectDeparture = useConnectionStore((state) => state.selectDeparture);

  // 출발 기록 상세 조회
  const { data: fromRecordDetail } = useGetRecordDetail(
    connectionFromRecordId ?? '',
    {
      enabled: !!connectionFromRecordId,
    },
  );

  // 출발 기록이 로드되면 자동으로 선택
  useEffect(() => {
    if (fromRecordDetail && !departure && connectionFromRecordId) {
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
          (fromRecordDetail.images?.length
            ? fromRecordDetail.images[0].medium?.url
            : null) ?? RECORD_PLACEHOLDER_IMAGE,
      });
    }
  }, [fromRecordDetail, departure, selectDeparture, connectionFromRecordId]);

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

  // 연결된 기록 ID 집합
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

  // API 응답을 RecordConnectionItem으로 변환
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
          const isTagMatch = extractTagNames(record.tags).some((tag) =>
            tag.toLowerCase().includes(query),
          );

          return (
            isTitleMatch || isLocationNameMatch || isAddressMatch || isTagMatch
          );
        })
      : recordsByBoundsData.records;

    return filteredRecords
      .filter((record: ApiRecord) => record.publicId !== connectionFromRecordId) // 출발 기록 제외
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
            ? recordWithImages.images[0].thumbnail?.url
            : RECORD_PLACEHOLDER_IMAGE;

        return {
          id: record.publicId,
          title: record.title,
          location: {
            name: record.location.name ?? '',
            address: record.location.address ?? '',
          },
          date: new Date(record.createdAt),
          tags: extractTagNames(record.tags),
          isRelated: Boolean(trimmedQuery),
          isConnected: connectedRecordIds.has(record.publicId),
          imageUrl: thumbnailUrl,
        };
      });
  }, [
    recordsByBoundsData,
    trimmedQuery,
    connectedRecordIds,
    connectionFromRecordId,
  ]);

  return {
    records,
    departure,
    arrival,
    searchQuery,
    connectionFromRecordId: connectionFromRecordId ?? '',
    arrivalId: arrival?.id,
  };
}
