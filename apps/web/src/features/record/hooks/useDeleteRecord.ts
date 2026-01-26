import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecord } from '@/infra/api/services/recordService';
import { removeStoredRecordPin } from '@/infra/storage/recordStorage';

/**
 * 기록 삭제 React Query Hook
 */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (publicId: string) => deleteRecord(publicId),
    onSuccess: (_, publicId) => {
      // 기록 관련 모든 쿼리 캐시 무효화하여 자동 refetch
      // ['records']로 시작하는 모든 쿼리 무효화 (bounds, graph 등 포함)
      void queryClient.invalidateQueries({ queryKey: ['records'] });

      // localStorage에서도 삭제
      removeStoredRecordPin(publicId);
    },
  });
}
