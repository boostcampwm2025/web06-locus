import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTag } from '@/infra/api/services/tagService';

/**
 * 태그 삭제 React Query Hook
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (publicId: string) => deleteTag(publicId),
    onSuccess: () => {
      // 태그 관련 모든 쿼리 캐시 무효화하여 자동 refetch
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
