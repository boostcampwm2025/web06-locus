import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/infra/api';
import { API_ENDPOINTS } from '@/infra/api/constants';
import {
  SearchRecordsRequestSchema,
  SearchRecordsResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type { SearchRecordsRequest } from '@locus/shared';

/**
 * 기록 검색 훅
 */
export function useRecords(request: SearchRecordsRequest | null) {
  return useQuery({
    queryKey: ['records', 'search', request],
    queryFn: async () => {
      if (!request) throw new Error('Search request is required');

      // 요청 검증
      const validatedRequest = SearchRecordsRequestSchema.parse(request);

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.append('keyword', validatedRequest.keyword);
      if (validatedRequest.tags?.length) {
        validatedRequest.tags.forEach((tag) => {
          params.append('tags', tag);
        });
      }
      if (validatedRequest.sortOrder) {
        params.append('sortOrder', validatedRequest.sortOrder);
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
    enabled: !!request && !!request.keyword.trim(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 모든 기록 목록 조회 훅 (빈 키워드로 전체 조회)
 */
export function useAllRecords(options?: { limit?: number }) {
  return useQuery({
    queryKey: ['records', 'all', options],
    queryFn: async () => {
      // 빈 키워드로 전체 기록 조회 (keyword는 필수이므로 공백 1자 사용)
      const request: SearchRecordsRequest = {
        keyword: ' ',
        size: options?.limit ?? 100,
      };

      const validatedRequest = SearchRecordsRequestSchema.parse(request);

      const params = new URLSearchParams();
      params.append('keyword', validatedRequest.keyword);
      if (validatedRequest.size) {
        params.append('size', String(validatedRequest.size));
      }

      const endpoint = `${API_ENDPOINTS.RECORDS_SEARCH}?${params.toString()}`;
      const response = await apiClient<unknown>(endpoint, {
        method: 'GET',
      });

      const validated = validateApiResponse(
        SearchRecordsResponseSchema,
        response,
      );

      return validated.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}
