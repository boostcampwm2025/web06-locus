import { useQuery } from '@tanstack/react-query';
import { getConnectedRecords } from '@/infra/api/services/connectionService';

/**
 * 연결된 기록 목록 조회 훅
 */
export function useConnectedRecords(
  publicId: string | null,
  options?: {
    cursor?: string;
    limit?: number;
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: ['connected-records', publicId, options],
    queryFn: () => {
      if (!publicId) throw new Error('publicId가 필요합니다');
      return getConnectedRecords(publicId, options);
    },
    enabled: options?.enabled !== false && !!publicId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
