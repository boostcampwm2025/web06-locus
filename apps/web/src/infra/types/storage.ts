import type { Record } from '@/features/record/types';
import type { Coordinates } from '@/features/record/types';

/**
 * localStorage에 저장된 기록 핀 정보
 */
export interface StoredRecordPin {
  record: Record;
  coordinates?: Coordinates;
  publicId: string; // 명시적으로 publicId 저장
}
