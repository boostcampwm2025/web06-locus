import { useQuery } from '@tanstack/react-query';
import { getRecordsByBounds } from '@/infra/api/services/recordService';
import type { GetRecordsByBoundsRequest, Record } from '@locus/shared';

export interface UseGetRecordsByBoundsOptions {
  enabled?: boolean;
}

/**
 * 지도 범위 기반 기록 조회 React Query Hook
 */
export function useGetRecordsByBounds(
  request: GetRecordsByBoundsRequest | null,
  options: UseGetRecordsByBoundsOptions = {},
) {
  return useQuery<{ records: Record[]; totalCount: number }, Error>({
    queryKey: ['records', 'bounds', request],
    queryFn: () => {
      if (!request) {
        throw new Error('Bounds request is required');
      }
      return getRecordsByBounds(request);
    },
    enabled: options.enabled !== false && request !== null,
    staleTime: 30000, // 30초간 캐시 유지
  });
}
