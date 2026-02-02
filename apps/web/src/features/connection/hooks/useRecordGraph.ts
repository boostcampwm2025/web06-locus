import { useQuery } from '@tanstack/react-query';
import { getRecordGraph } from '@/infra/api/services/connectionService';
import type { GraphResponse } from '@/infra/types/connection';

/**
 * 기록 그래프 조회 훅
 */
export function useRecordGraph(
  publicId: string | null,
  options?: {
    maxNodes?: number;
    maxEdges?: number;
    maxDepth?: number;
    enabled?: boolean;
  },
) {
  // enabled 옵션이 명시적으로 전달되면 사용하고, 아니면 publicId가 있으면 true
  const enabled =
    options?.enabled !== undefined ? options.enabled && !!publicId : !!publicId;

  return useQuery<GraphResponse, Error>({
    queryKey: ['record-graph', publicId, options],
    queryFn: () => {
      if (!publicId) throw new Error('publicId가 필요합니다');
      return getRecordGraph(publicId, options);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
