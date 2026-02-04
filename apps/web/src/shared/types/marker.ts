export interface Coordinates {
  lat: number;
  lng: number;
}

export type PinVariant = 'record' | 'current' | 'cluster';

export interface PinMarkerData {
  id: string | number;
  position: Coordinates;
  variant: PinVariant;
  /** 클러스터 핀일 때만: 해당 그리드 내 기록 개수 */
  count?: number;
}

export interface PinMarkerProps {
  pin: PinMarkerData;
  isSelected?: boolean;
  onClick?: (id: string | number) => void;
}
