import { useQuery } from '@tanstack/react-query';
import { getRecordsByBounds } from '@/infra/api/services/recordService';
import type { GetRecordsByBoundsRequest, Record } from '@locus/shared';
import { roundBoundsToGrid } from '@/features/home/utils/boundsUtils';

export interface UseGetRecordsByBoundsOptions {
  enabled?: boolean;
}

/**
 * 지도 범위 기반 기록 조회 React Query Hook
 * Grid 기반 캐싱: bounds를 반올림하여 일정 구역 단위로 묶어서 캐싱
 */
export function useGetRecordsByBounds(
  request: GetRecordsByBoundsRequest | null,
  options: UseGetRecordsByBoundsOptions = {},
) {
  // Grid 단위로 반올림된 bounds를 queryKey에 사용하여 캐싱 효율성 향상
  const gridBounds = request
    ? roundBoundsToGrid({
        neLat: request.neLat,
        neLng: request.neLng,
        swLat: request.swLat,
        swLng: request.swLng,
      })
    : null;

  // 실제 API 요청은 원본 request 사용 (정확한 bounds 필요)
  // queryKey는 반올림된 bounds 사용 (캐싱 효율성)
  return useQuery<{ records: Record[]; totalCount: number }, Error>({
    queryKey: ['records', 'bounds', gridBounds],
    queryFn: () => {
      if (!request) {
        throw new Error('Bounds request is required');
      }
      return getRecordsByBounds(request);
    },
    enabled: options.enabled !== false && request !== null,
    staleTime: 300000, // 5분간 캐시 유지 (Grid 기반 캐싱이므로 더 길게)
  });
}
