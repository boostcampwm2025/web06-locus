export interface Coordinates {
  lat: number;
  lng: number;
}

export type PinVariant = 'record' | 'current';

export interface PinMarkerData {
  id: string | number;
  position: Coordinates;
  variant: PinVariant;
}

export interface PinMarkerProps {
  pin: PinMarkerData;
  isSelected?: boolean;
  onClick?: (id: string | number) => void;
}
