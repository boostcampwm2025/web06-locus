import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { apiClient } from '@/infra/api';
import { API_ENDPOINTS } from '@/infra/api/constants';
import {
  SearchRecordsRequestSchema,
  SearchRecordsResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type { SearchRecordsRequest } from '@locus/shared';

/**
 * 디바운싱이 적용된 기록 검색 훅
 * @param keyword - 검색 키워드
 * @param options - 추가 검색 옵션 (tags, hasImage, isFavorite 등)
 */
export function useSearchRecords(
  keyword: string,
  options?: {
    tags?: string[];
    hasImage?: boolean;
    isFavorite?: boolean;
    cursor?: string;
    size?: number;
    enabled?: boolean;
  },
) {
  // 디바운싱 적용 (300ms 지연)
  const debouncedKeyword = useDebounce(keyword.trim(), 300);

  // 검색어가 있을 때만 쿼리 활성화
  const isEnabled = !!debouncedKeyword && options?.enabled !== false;

  return useQuery({
    queryKey: [
      'records',
      'search',
      debouncedKeyword,
      options?.tags,
      options?.hasImage,
      options?.isFavorite,
      options?.cursor,
      options?.size,
    ],
    queryFn: async () => {
      // enabled로 이미 막혔으므로 여기서는 항상 유효한 검색어가 있음
      const searchRequest: SearchRecordsRequest = {
        keyword: debouncedKeyword,
        tags: options?.tags,
        hasImage: options?.hasImage,
        isFavorite: options?.isFavorite,
        cursor: options?.cursor,
        size: options?.size,
      };

      // 요청 검증
      const validatedRequest = SearchRecordsRequestSchema.parse(searchRequest);

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.append('keyword', validatedRequest.keyword);
      if (validatedRequest.tags?.length) {
        validatedRequest.tags.forEach((tag) => {
          params.append('tags', tag);
        });
      }
      if (validatedRequest.hasImage !== undefined) {
        params.append('hasImage', String(validatedRequest.hasImage));
      }
      if (validatedRequest.isFavorite !== undefined) {
        params.append('isFavorite', String(validatedRequest.isFavorite));
      }
      if (validatedRequest.cursor) {
        params.append('cursor', validatedRequest.cursor);
      }
      if (validatedRequest.size) {
        params.append('size', String(validatedRequest.size));
      }

      const endpoint = `${API_ENDPOINTS.RECORDS_SEARCH}?${params.toString()}`;
      const response = await apiClient<unknown>(endpoint, {
        method: 'GET',
      });

      // 응답 검증
      const validated = validateApiResponse(
        SearchRecordsResponseSchema,
        response,
      );

      return validated.data;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
