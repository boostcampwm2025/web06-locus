import type { Record } from '@/features/record/types';
import type { Coordinates, Location } from '@/features/record/types';

export interface MapViewportProps {
  className?: string;
  createdRecordPins?: {
    record: Record;
    coordinates?: Coordinates;
  }[];
  connectedRecords?: {
    fromId: string;
    toId: string;
  } | null;
  targetLocation?: Coordinates | null;
  onTargetLocationChange?: (coordinates: Coordinates) => void;
  onCreateRecord?: (location: Location, coordinates?: Coordinates) => void;
  /** 데스크톱 등에서 제공 시: 핀 클릭 시 바텀시트 대신 이 콜백만 호출 (바텀시트 미표시) */
  onRecordPinClick?: (recordId: string) => void;
}
