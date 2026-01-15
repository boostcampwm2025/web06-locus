import type { Record } from '@/features/record/types';
import type { Coordinates } from '@/features/record/types';

export interface MapViewportProps {
  className?: string;
  newRecordPin?: {
    record: Record;
    coordinates?: Coordinates;
  } | null;
}
