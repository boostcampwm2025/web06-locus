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
 * 전체 기록 목록 조회 훅 (하이브리드 캐시 전략)
 * - GET /records/all 엔드포인트 사용
 * - 고정 캐시 키 ['records', 'all']로 전체 데이터를 한 번만 가져옴
 * - 필터링은 클라이언트 사이드에서 처리 (즉시 반응, 0ms 지연)
 * - 리스트 뷰 전용 (좌표 없음, 클러스터링 불가)
 *
 * limit: 100
 * - 백엔드 DTO 최대값에 맞춤
 * - 클라이언트 사이드 페이지네이션으로 추가 로딩 없이 처리 가능
 * - 메모리 효율적 (좌표 데이터 제외)
 */
export function useAllRecords(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['records', 'all'], // 고정 키: 파라미터 없이 하나의 Source of Truth 유지
    queryFn: () =>
      getAllRecords({
        page: 1,
        sortOrder: 'desc',
        limit: 100, // 백엔드 DTO 최대값에 맞춤
      }),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 사용하지 않아도 30분간 메모리 유지
  });
}
