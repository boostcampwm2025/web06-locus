import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTag,
  type CreateTagRequest,
  type TagResponse,
} from '@/infra/api/services/tagService';

/**
 * 태그 생성 React Query Hook
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<TagResponse, Error, CreateTagRequest>({
    mutationFn: (request) => createTag(request),
    onSuccess: () => {
      // 태그 목록 캐시 무효화하여 자동 refetch
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
