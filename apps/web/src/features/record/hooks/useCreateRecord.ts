import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecord } from '@/infra/api/services/recordService';
import type { CreateRecordRequest, RecordWithImages } from '@locus/shared';

interface CreateRecordParams {
  request: CreateRecordRequest;
  images?: File[];
}

/**
 * 기록 생성 React Query Hook
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation<RecordWithImages, Error, CreateRecordParams>({
    mutationFn: ({ request, images = [] }) => createRecord(request, images),
    onSuccess: () => {
      // 기록 목록 캐시 무효화하여 자동 refetch
      void queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}
