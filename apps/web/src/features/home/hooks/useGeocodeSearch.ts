import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geocode } from '@/infra/api/services/mapService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { GeocodeResponse } from '@/infra/types/map';

/**
 * 주소 검색을 위한 지오코딩 React Query Hook (디바운스 적용)
 * - 입력값이 변경되어도 300ms 동안 가만히 있을 때만 API 호출
 * - UI의 Input과 연결하여 사용
 */
export function useGeocodeSearch(initialAddress = '') {
  const [address, setAddress] = useState(initialAddress);

  // 1. 입력값이 변경되어도 300ms 동안 가만히 있을 때만 값이 바뀜
  const debouncedAddress = useDebounce(address, 300);

  const query = useQuery<GeocodeResponse, Error>({
    // 2. queryKey에 디바운스된 값을 넣어 불필요한 캐시 생성을 막음
    queryKey: ['geocode', debouncedAddress.trim()],
    queryFn: ({ signal }) => geocode(debouncedAddress.trim(), { signal }),

    // 3. 디바운스된 값이 있을 때만 활성화
    enabled: debouncedAddress.trim().length > 0,

    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: false, // 오타일 확률이 높으므로 재시도 차단
  });

  return {
    address,
    setAddress, // UI의 Input과 연결
    ...query, // data, isLoading, error 등 반환
  };
}
