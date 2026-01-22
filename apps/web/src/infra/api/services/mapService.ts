import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../constants';
import type { GeocodeResponse } from '@/infra/types/map';

/**
 * 주소를 좌표로 변환하는 지오코딩 API 호출
 * @param address - 검색할 주소 문자열
 * @param options - AbortSignal 등 추가 옵션
 * @returns 지오코딩 결과 (주소 후보 목록과 좌표)
 */
export async function geocode(
  address: string,
  options?: { signal?: AbortSignal },
): Promise<GeocodeResponse> {
  const params = new URLSearchParams({ address });
  const response = await apiClient<GeocodeResponse>(
    `${API_ENDPOINTS.MAPS_GEOCODE}?${params.toString()}`,
    {
      method: 'GET',
      signal: options?.signal,
    },
  );
  return response;
}
