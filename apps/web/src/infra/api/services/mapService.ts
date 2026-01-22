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

/**
 * 역지오코딩 응답 타입
 */
export interface ReverseGeocodeResponse {
  status: string;
  data: {
    name: string | null;
    address: string | null;
  };
}

/**
 * 좌표를 주소로 변환하는 역지오코딩 API 호출
 * @param latitude - 위도
 * @param longitude - 경도
 * @param options - AbortSignal 등 추가 옵션
 * @returns 역지오코딩 결과 (장소 이름과 주소)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  options?: { signal?: AbortSignal },
): Promise<ReverseGeocodeResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  const response = await apiClient<ReverseGeocodeResponse>(
    `${API_ENDPOINTS.MAPS_REVERSE_GEOCODE}?${params.toString()}`,
    {
      method: 'GET',
      signal: options?.signal, // 불필요한 I/O 방지를 위해 signal 전달
    },
  );
  return response;
}
