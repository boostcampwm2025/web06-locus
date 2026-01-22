/**
 * 사용자별로 격리된 localStorage 키를 생성하는 유틸리티
 *
 * 사용자 ID를 키에 포함시켜 다른 계정 간 데이터 공유를 방지합니다.
 */

/**
 * localStorage에서 현재 사용자 ID를 가져옵니다.
 * authStore와의 순환 의존성을 피하기 위해 localStorage를 직접 참조합니다.
 * 로그인하지 않은 경우 null을 반환합니다.
 */
function getCurrentUserIdFromStorage(): string | null {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return null;
    }
    return localStorage.getItem('current_user_id');
  } catch {
    return null;
  }
}

/**
 * 사용자별로 격리된 키를 생성합니다.
 *
 * @param baseKey 기본 키 (예: 'locus_records')
 * @param userId 사용자 ID (null이면 'anonymous' 사용)
 * @returns 사용자별로 격리된 키 (예: 'locus_records_user_abc123')
 */
export function getUserScopedKey(
  baseKey: string,
  userId: string | null,
): string {
  const userPart = userId ? `_user_${userId}` : '_anonymous';
  return `${baseKey}${userPart}`;
}

/**
 * 현재 사용자에 대한 격리된 키를 생성합니다.
 *
 * @param baseKey 기본 키
 * @param userId 사용자 ID (선택적, 제공되지 않으면 localStorage에서 가져옴)
 * @returns 현재 사용자에 대한 격리된 키
 */
export function getCurrentUserScopedKey(
  baseKey: string,
  userId?: string | null,
): string {
  // userId가 제공되지 않으면 localStorage에서 가져오기
  const currentUserId = userId ?? getCurrentUserIdFromStorage();
  return getUserScopedKey(baseKey, currentUserId);
}

/**
 * 사용자 ID를 저장합니다.
 * 로그인 시 호출되어야 합니다.
 */
export function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem('current_user_id', userId);
  } catch (error) {
    console.error('사용자 ID 저장 실패:', error);
  }
}

/**
 * 사용자 ID를 제거합니다.
 * 로그아웃 시 호출되어야 합니다.
 */
export function clearCurrentUserId(): void {
  try {
    localStorage.removeItem('current_user_id');
  } catch (error) {
    console.error('사용자 ID 제거 실패:', error);
  }
}

/**
 * 모든 사용자별 스토리지의 기본 키 목록
 * 로그아웃 시 이 키들을 사용하여 사용자 데이터를 정리합니다.
 */
export const USER_SCOPED_STORAGE_KEYS = [
  'locus_created_records',
  'locus_connections',
  'onboarding_completed',
  'locus_map_state',
] as const;

/**
 * 이전 사용자의 데이터를 정리합니다.
 * 로그아웃 시 이전 사용자의 모든 데이터를 삭제할 수 있습니다.
 *
 * @param userId 정리할 사용자 ID
 * @param baseKeys 정리할 기본 키 목록 (기본값: USER_SCOPED_STORAGE_KEYS)
 */
export function clearUserData(
  userId: string,
  baseKeys: string[] = [...USER_SCOPED_STORAGE_KEYS],
): void {
  try {
    baseKeys.forEach((baseKey) => {
      const scopedKey = getUserScopedKey(baseKey, userId);
      localStorage.removeItem(scopedKey);
    });
  } catch (error) {
    console.error('사용자 데이터 정리 실패:', error);
  }
}
