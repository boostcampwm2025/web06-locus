import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
  type UserProfile,
} from '@/infra/api/services/userService';

export const CURRENT_USER_QUERY_KEY = ['user', 'me'] as const;

const STALE_TIME_MS = 30 * 60 * 1000; // 30분 — 수정 빈도가 낮으므로 긴 캐시, 수정 성공 시 invalidate

/**
 * 현재 로그인한 사용자 정보 조회 (GET /users/me)
 * 설정 페이지에서 프로필 정보 표시용
 */
export function useCurrentUser() {
  return useQuery<UserProfile, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUser(),
    staleTime: STALE_TIME_MS,
  });
}

/**
 * 프로필 수정 성공 시 호출하여 현재 사용자 캐시를 무효화합니다.
 * useMutation onSuccess 등에서 사용: invalidateCurrentUser() 후 리페치됩니다.
 */
export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  };
}
