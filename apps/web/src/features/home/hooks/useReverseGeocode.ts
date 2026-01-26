import { useQuery } from '@tanstack/react-query';
import { reverseGeocode } from '@/infra/api/services/mapService';
import type { ReverseGeocodeResponse } from '@/infra/api/services/mapService';

export interface UseReverseGeocodeOptions {
  latitude: number | null;
  longitude: number | null;
  enabled?: boolean;
}

/**
 * 좌표를 주소로 변환하는 역지오코딩 React Query Hook
 * - 같은 좌표에 대한 요청은 자동으로 캐시되어 불필요한 API 호출을 방지
 * - 좌표는 소수점 4째 자리까지 고정하여 캐시 효율성 향상
 * - 24시간 캐시로 서버 요청 최소화, 메모리는 25시간 보관
 */
export function useReverseGeocode({
  latitude,
  longitude,
  enabled = true,
}: UseReverseGeocodeOptions) {
  // 좌표를 소수점 4째 자리까지 고정
  const fixedLat = latitude !== null ? parseFloat(latitude.toFixed(4)) : null;
  const fixedLng = longitude !== null ? parseFloat(longitude.toFixed(4)) : null;

  return useQuery<ReverseGeocodeResponse, Error>({
    queryKey: ['reverseGeocode', fixedLat, fixedLng],
    queryFn: ({ signal }) => reverseGeocode(fixedLat!, fixedLng!, { signal }),
    enabled: enabled && fixedLat !== null && fixedLng !== null,

    // 과감한 캐시 설정
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000 + 60 * 60 * 1000, // 메모리에서 25시간 보관
    placeholderData: (previousData) => previousData, // 로딩 중에도 이전 주소 노출

    retry: false,
  });
}
