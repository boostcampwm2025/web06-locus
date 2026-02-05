import { useMemo } from 'react';
import { useAllRecords } from './useRecords';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import { sortRecordsByFavorite } from '@/shared/utils/recordSortUtils';
import { extractTagNames } from '@/shared/utils/tagUtils';
import type { UseSidebarRecordsProps } from '@/features/record/types';

export function useSidebarRecords({
  sortOrder,
  startDate,
  endDate,
  favoritesOnly,
  includeImages,
  selectedCategory,
}: UseSidebarRecordsProps) {
  // 선택된 카테고리가 태그인 경우 태그 publicId 추출
  const tagPublicId =
    selectedCategory && selectedCategory !== 'all'
      ? selectedCategory
      : undefined;

  // 서버 사이드 태그 필터링 적용
  const {
    data: allRecordsData,
    isLoading,
    isError,
  } = useAllRecords({
    tagPublicIds: tagPublicId ? [tagPublicId] : undefined,
  });

  const filteredAndSortedRecords = useMemo(() => {
    if (!allRecordsData?.records) return [];

    let result = [...allRecordsData.records];

    // 1. 날짜 필터링 (클라이언트 사이드)
    if (startDate || endDate) {
      result = result.filter((record) => {
        const recordDate = new Date(record.createdAt);
        let start: Date | null = null;
        let end: Date | null = null;

        if (startDate) {
          start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // 시작일은 00:00:00부터 포함
        }

        if (endDate) {
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // 종료일은 23:59:59까지 포함
        }

        if (start && recordDate < start) return false;
        if (end && recordDate > end) return false;
        return true;
      });
    }

    // 2. 카테고리(태그) 필터링은 서버 사이드에서 처리됨

    // 3. 즐겨찾기/이미지 필터링 (클라이언트 사이드)
    if (favoritesOnly) {
      result = result.filter((r) => r.isFavorite);
    }
    if (includeImages) {
      result = result.filter((r) => r.images && r.images.length > 0);
    }

    // 4. 정렬 (즐겨찾기 우선 + 날짜순)
    let sorted = sortRecordsByFavorite(result);
    if (sortOrder === 'oldest') {
      sorted = [...sorted].reverse();
    }

    // 5. UI 포맷으로 변환
    return sorted.map((record) => ({
      id: record.publicId,
      title: record.title,
      location: {
        name: record.location.name ?? '',
        address: record.location.address ?? '',
      },
      date: new Date(record.createdAt),
      tags: extractTagNames(record.tags),
      imageUrl: record.images?.[0]?.thumbnail?.url ?? RECORD_PLACEHOLDER_IMAGE,
      connectionCount: record.connectionCount,
      isFavorite: record.isFavorite,
    }));
  }, [
    allRecordsData,
    sortOrder,
    startDate,
    endDate,
    favoritesOnly,
    includeImages,
  ]);

  const totalCount = allRecordsData?.totalCount ?? 0;

  return {
    records: filteredAndSortedRecords,
    totalCount,
    isLoading,
    isError,
  };
}
