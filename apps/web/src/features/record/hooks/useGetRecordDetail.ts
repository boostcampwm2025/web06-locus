import { useQuery } from '@tanstack/react-query';
import { getRecordDetail } from '@/infra/api/services/recordService';
import type { RecordDetail } from '@locus/shared';
import { logger } from '@/shared/utils/logger';

export interface UseGetRecordDetailOptions {
  enabled?: boolean;
}

/**
 * 기록 상세 조회 React Query Hook
 */
export function useGetRecordDetail(
  publicId: string | null,
  options: UseGetRecordDetailOptions = {},
) {
  return useQuery<RecordDetail, Error>({
    queryKey: ['record', 'detail', publicId],
    queryFn: async () => {
      if (!publicId) {
        throw new Error('기록 ID가 필요합니다.');
      }
      try {
        return await getRecordDetail(publicId);
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error('기록 상세 조회 실패'),
          {
            publicId,
            component: 'useGetRecordDetail',
          },
        );
        throw error;
      }
    },
    enabled: options.enabled !== false && publicId !== null,
    retry: 1,
  });
}
