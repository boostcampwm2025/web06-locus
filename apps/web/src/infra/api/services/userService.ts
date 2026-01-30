import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';

/**
 * 사용자 정보 응답 타입 (GET /users/me data 필드)
 * 백엔드 ResponseTransformInterceptor로 { status: 'success', data } 래핑됨
 */
export interface UserProfile {
  publicId: string;
  email: string;
  nickname: string | null;
  profileImageUrl: string | null;
  provider: string;
  createdAt: string;
}

/**
 * GET /users/me API 원시 응답 (status + data 래핑)
 */
interface MeApiResponse {
  status: 'success';
  data: UserProfile;
}

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/users/me
 * Authorization: Bearer {accessToken}
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await apiClient<MeApiResponse>(API_ENDPOINTS.USERS_ME, {
    method: 'GET',
  });
  if (response?.status === 'success' && response.data != null) {
    return response.data;
  }
  throw new Error('사용자 정보 응답 형식이 올바르지 않습니다.');
}
