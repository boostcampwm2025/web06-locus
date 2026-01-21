import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../constants';

/**
 * 사용자 정보 응답 타입
 */
export interface UserProfile {
  id: string;
  publicId: string;
  email: string;
  nickname: string | null;
  profileImageUrl: string | null;
  provider: string;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/users/me
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return await apiClient<UserProfile>(API_ENDPOINTS.USERS_ME, {
    method: 'GET',
  });
}
