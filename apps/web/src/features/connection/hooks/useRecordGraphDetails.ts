import { useQuery } from '@tanstack/react-query';
import { getRecordGraphDetails } from '@/infra/api/services/connectionService';
import type { GraphDetailsResponse } from '@/infra/types/connection';

/**
 * 연결된 기록 조회(Depth=1) 훅
 * GET /records/{publicId}/graph/details
 */
export function useRecordGraphDetails(
  publicId: string | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    options?.enabled !== undefined ? options.enabled && !!publicId : !!publicId;

  return useQuery<GraphDetailsResponse, Error>({
    queryKey: ['record-graph-details', publicId],
    queryFn: () => {
      if (!publicId) throw new Error('publicId가 필요합니다');
      return getRecordGraphDetails(publicId);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
