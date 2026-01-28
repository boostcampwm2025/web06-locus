import { useMapInstance } from '@/shared/hooks/useMapInstance';
import type { UseNaverMapOptions } from '../../types';

export function useRecordMap({
  initialCoordinates,
  zoom = 16,
  zoomControl = false,
  defaultCenter,
}: UseNaverMapOptions = {}) {
  return useMapInstance({
    initialCoordinates,
    zoom,
    zoomControl,
    defaultCenter,
  });
}
