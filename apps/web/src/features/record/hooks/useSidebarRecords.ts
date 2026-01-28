import { useMemo } from 'react';
import { useAllRecords } from './useRecords';
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
  categories,
}: UseSidebarRecordsProps) {
  const { data: allRecordsData, isLoading, isError } = useAllRecords();

  const filteredAndSortedRecords = useMemo(() => {
    if (!allRecordsData?.records) return [];

    let result = [...allRecordsData.records];

    // 1. 날짜 필터링
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

    // 2. 카테고리(태그) 필터링
    if (selectedCategory && selectedCategory !== 'all') {
      const targetLabel = categories.find(
        (c) => c.id === selectedCategory,
      )?.label;
      result = result.filter((r) =>
        extractTagNames(r.tags).includes(targetLabel ?? ''),
      );
    }

    // 3. 즐겨찾기/이미지 필터링 (필요시 추가)
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
      imageUrl: record.images?.[0]?.thumbnail?.url,
      connectionCount: record.connectionCount,
    }));
  }, [
    allRecordsData,
    sortOrder,
    startDate,
    endDate,
    selectedCategory,
    favoritesOnly,
    includeImages,
    categories,
  ]);

  return { records: filteredAndSortedRecords, isLoading, isError };
}
