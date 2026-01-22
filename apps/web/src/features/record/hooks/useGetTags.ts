import { useQuery } from '@tanstack/react-query';
import { getTags, type TagResponse } from '@/infra/api/services/tagService';

/**
 * 태그 전체 조회 React Query Hook
 */
export function useGetTags() {
  return useQuery<TagResponse[], Error>({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });
}
