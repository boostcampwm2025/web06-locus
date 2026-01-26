import { useQuery } from '@tanstack/react-query';
import { geocode } from '@/infra/api/services/mapService';
import type { GeocodeResponse } from '@/infra/types/map';
import type { UseGeocodeOptions } from '../types/useGeocode';

/**
 * 주소를 좌표로 변환하는 지오코딩 React Query Hook
 */
export function useGeocode({ address, enabled = false }: UseGeocodeOptions) {
  return useQuery<GeocodeResponse, Error>({
    queryKey: ['geocode', address],
    queryFn: () => geocode(address),
    enabled: enabled && address.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: false,
  });
}
