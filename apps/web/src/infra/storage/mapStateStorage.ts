import { getCurrentUserScopedKey } from './userScopedStorage';

const MAP_STATE_BASE_KEY = 'locus_map_state';

export interface MapState {
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
}

/**
 * 지도 상태를 저장합니다.
 */
export function saveMapState(state: MapState): void {
  try {
    const key = getCurrentUserScopedKey(MAP_STATE_BASE_KEY);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('지도 상태 저장 실패:', error);
  }
}

/**
 * 저장된 지도 상태를 불러옵니다.
 */
export function loadMapState(): MapState | null {
  try {
    const key = getCurrentUserScopedKey(MAP_STATE_BASE_KEY);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as MapState;
  } catch (error) {
    console.error('지도 상태 불러오기 실패:', error);
    return null;
  }
}

/**
 * 지도 상태를 초기화합니다.
 */
export function clearMapState(): void {
  try {
    const key = getCurrentUserScopedKey(MAP_STATE_BASE_KEY);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('지도 상태 초기화 실패:', error);
  }
}
