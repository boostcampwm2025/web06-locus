import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';

/**
 * 오리 코멘트 조회 API 응답
 * - API: GET /duck/comments (JWT 인증 필요)
 * - 백엔드 ResponseTransformInterceptor로 { status: 'success', data } 래핑됨
 */
export interface DuckCommentApiResponse {
  status: 'success';
  data: { comments: string[] };
}

/**
 * 오리 코멘트 목록 조회
 * - 인증된 사용자별 오리가 반환하는 코멘트 10개
 */
export async function getDuckComments(): Promise<string[]> {
  const response = await apiClient<DuckCommentApiResponse>(
    API_ENDPOINTS.DUCK_COMMENTS,
    { method: 'GET', requireAuth: true },
  );
  return response.data?.comments ?? [];
}
