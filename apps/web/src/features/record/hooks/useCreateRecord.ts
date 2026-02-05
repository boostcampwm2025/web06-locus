import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecord } from '@/infra/api/services/recordService';
import type { CreateRecordRequest, RecordWithImages } from '@locus/shared';
import { useDuckCommentsStore } from '@/features/home/domain/duckCommentsStore';

interface CreateRecordParams {
  request: CreateRecordRequest;
  images?: File[];
}

/**
 * 기록 생성 React Query Hook
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();
  const refreshDuckComments = useDuckCommentsStore((s) => s.refreshComments);

  return useMutation<RecordWithImages, Error, CreateRecordParams>({
    mutationFn: ({ request, images = [] }) => createRecord(request, images),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['records'] });
      void refreshDuckComments();
    },
  });
}
