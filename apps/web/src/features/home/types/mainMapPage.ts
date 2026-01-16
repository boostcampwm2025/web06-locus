import type { Record } from '@/features/record/types';
import type { Coordinates } from '@/features/record/types';

/**
 * React Router location state의 타입 정의
 * MainMapPage에서 저장된 record를 전달받을 때 사용
 */
export interface MainMapPageLocationState {
  savedRecord?: Record & { coordinates?: Coordinates };
  connectedRecords?: {
    fromId: string;
    toId: string;
  };
}
