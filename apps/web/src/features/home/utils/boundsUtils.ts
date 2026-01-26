/**
 * 지도 bounds 관련 유틸리티 함수
 */

export interface Bounds {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
}

/**
 * Grid 단위로 bounds를 반올림하여 캐싱 키 생성
 * 예: 0.01도 단위로 반올림 (약 1km)
 */
const GRID_SIZE = 0.01; // 약 1km

export function roundBoundsToGrid(bounds: Bounds): Bounds {
  return {
    neLat: Math.ceil(bounds.neLat / GRID_SIZE) * GRID_SIZE,
    neLng: Math.ceil(bounds.neLng / GRID_SIZE) * GRID_SIZE,
    swLat: Math.floor(bounds.swLat / GRID_SIZE) * GRID_SIZE,
    swLng: Math.floor(bounds.swLng / GRID_SIZE) * GRID_SIZE,
  };
}

/**
 * 줌 레벨에 따른 확장 팩터 계산
 * - 줌 인(상세 지도, zoom >= 12): 3~4배 확장 (데이터가 적음)
 * - 중간 줌 (8 <= zoom < 12): 2배 확장
 * - 줌 아웃(광역 지도, zoom < 8): 1.5배 확장 (데이터가 많을 수 있음)
 */
export function getExpansionFactor(zoom: number): number {
  if (zoom >= 12) {
    // 상세 지도: 넓게 확장해도 데이터가 적음
    return 3;
  } else if (zoom >= 8) {
    // 중간 줌: 적당히 확장
    return 2;
  } else {
    // 광역 지도: 최소한으로 확장 (데이터가 많을 수 있음)
    return 1.5;
  }
}

/**
 * 현재 화면 bounds를 확장 (줌 레벨에 따라 동적 조정)
 * 화면 밖 1~2페이지 분량의 데이터를 미리 가져오기 위함
 */
export function expandBounds(bounds: Bounds, zoom: number): Bounds {
  const expansionFactor = getExpansionFactor(zoom);
  const latDiff = bounds.neLat - bounds.swLat;
  const lngDiff = bounds.neLng - bounds.swLng;

  const latExpansion = (latDiff * expansionFactor) / 2;
  const lngExpansion = (lngDiff * expansionFactor) / 2;

  return {
    neLat: bounds.neLat + latExpansion,
    neLng: bounds.neLng + lngExpansion,
    swLat: bounds.swLat - latExpansion,
    swLng: bounds.swLng - lngExpansion,
  };
}

/**
 * 좌표가 bounds 내에 있는지 확인
 */
export function isWithinBounds(
  lat: number,
  lng: number,
  bounds: Bounds,
): boolean {
  return (
    lat >= bounds.swLat &&
    lat <= bounds.neLat &&
    lng >= bounds.swLng &&
    lng <= bounds.neLng
  );
}

/**
 * 현재 bounds가 확장된 bounds의 경계선에 접근했는지 확인
 * 경계선 20% 이내 접근 시 true 반환
 */
const BOUNDARY_THRESHOLD = 0.2; // 20%

export function isNearBoundary(
  currentBounds: Bounds,
  expandedBounds: Bounds,
): boolean {
  const currentLatDiff = currentBounds.neLat - currentBounds.swLat;
  const currentLngDiff = currentBounds.neLng - currentBounds.swLng;

  const thresholdLat = currentLatDiff * BOUNDARY_THRESHOLD;
  const thresholdLng = currentLngDiff * BOUNDARY_THRESHOLD;

  // 북쪽 경계 접근
  const nearNorth = currentBounds.neLat >= expandedBounds.neLat - thresholdLat;
  // 남쪽 경계 접근
  const nearSouth = currentBounds.swLat <= expandedBounds.swLat + thresholdLat;
  // 동쪽 경계 접근
  const nearEast = currentBounds.neLng >= expandedBounds.neLng - thresholdLng;
  // 서쪽 경계 접근
  const nearWest = currentBounds.swLng <= expandedBounds.swLng + thresholdLng;

  return nearNorth || nearSouth || nearEast || nearWest;
}

/**
 * 두 bounds가 같은 Grid인지 확인
 */
export function isSameGrid(bounds1: Bounds, bounds2: Bounds): boolean {
  const grid1 = roundBoundsToGrid(bounds1);
  const grid2 = roundBoundsToGrid(bounds2);

  return (
    grid1.neLat === grid2.neLat &&
    grid1.neLng === grid2.neLng &&
    grid1.swLat === grid2.swLat &&
    grid1.swLng === grid2.swLng
  );
}
