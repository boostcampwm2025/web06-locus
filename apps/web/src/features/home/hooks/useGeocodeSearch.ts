import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geocode } from '@/infra/api/services/mapService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { GeocodeResponse } from '@/infra/types/map';

type UseGeocodeSearchOptions =
  | { controlled?: false }
  | { controlled: true; controlledQuery: string };

/**
 * 주소 검색을 위한 지오코딩 React Query Hook (디바운스 적용)
 * - 입력값이 변경되어도 300ms 동안 가만히 있을 때만 API 호출
 * - UI의 Input과 연결하여 사용
 * - controlled: true 이고 controlledQuery를 넘기면 외부 상태와 연동 가능
 */
export function useGeocodeSearch(
  initialAddress = '',
  options?: UseGeocodeSearchOptions,
) {
  const [address, setAddress] = useState(initialAddress);

  const isControlled = options?.controlled === true;
  const controlledQuery = options?.controlled ? options.controlledQuery : '';

  const debouncedUncontrolled = useDebounce(address, 300);
  const debouncedControlled = useDebounce(controlledQuery, 300);
  const debouncedAddress = isControlled
    ? debouncedControlled
    : debouncedUncontrolled;

  const query = useQuery<GeocodeResponse, Error>({
    queryKey: ['geocode', debouncedAddress.trim()],
    queryFn: ({ signal }) => geocode(debouncedAddress.trim(), { signal }),

    enabled: debouncedAddress.trim().length > 0,

    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: false,
  });

  return {
    address: isControlled ? controlledQuery : address,
    setAddress: isControlled
      ? () => {
          /* 외부에서 제어하므로 아무 작업도 하지 않음 */
        }
      : setAddress,
    ...query,
  };
}
