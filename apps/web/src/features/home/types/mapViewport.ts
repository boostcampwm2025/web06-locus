import type { Record } from '@/features/record/types';
import type { Coordinates } from '@/features/record/types';

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
}
