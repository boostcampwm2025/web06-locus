import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/infra/api';
import { API_ENDPOINTS } from '@/infra/api/constants';
import {
  SearchRecordsRequestSchema,
  SearchRecordsResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type { SearchRecordsRequest } from '@locus/shared';
import { getAllRecords } from '@/infra/api/services/recordService';

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
 * 전체 기록 목록 조회 훅
 * - GET /records/all 엔드포인트 사용
 * - 태그 필터링 지원 (서버 사이드 필터링)
 * - 리스트 뷰 전용 (좌표 없음, 클러스터링 불가)
 *
 * limit: 100
 * - 백엔드 DTO 최대값에 맞춤
 * - 메모리 효율적 (좌표 데이터 제외)
 */
export function useAllRecords(options?: {
  enabled?: boolean;
  tagPublicIds?: string[];
}) {
  return useQuery({
    queryKey: ['records', 'all', options?.tagPublicIds], // 태그 필터 포함
    queryFn: () =>
      getAllRecords({
        page: 1,
        sortOrder: 'desc',
        limit: 100, // 백엔드 DTO 최대값에 맞춤
        tagPublicIds: options?.tagPublicIds,
      }),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 사용하지 않아도 30분간 메모리 유지
  });
}
