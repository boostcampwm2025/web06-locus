import type { ReactNode } from 'react';
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
  /**
   * 데스크톱에서 제공 시: 핀 클릭 시 바텀시트 대신 이 콜백만 호출 (바텀시트 미표시).
   * 클러스터 핀 클릭 시 대표 기록 ID + 클러스터 정보(recordIds, records) 전달.
   */
  onRecordPinClick?: (
    recordId: string,
    meta?: {
      clusterRecordIds?: string[];
      clusterRecords?: Record[];
      /** 단일 핀 클릭 시 해당 기록 (이미지 등 지도 API 데이터로 카드 표시용) */
      singleRecord?: Record;
      /** 단일 핀 클릭 시 위도/경도 (특정 장소에 새 기록 남기기용) */
      coordinates?: { lat: number; lng: number };
    },
  ) => void;
  /**
   * 데스크톱 등에서 제공 시: 지도 빈 공간 클릭 시 RecordCreateBottomSheet 대신 렌더링되는 컴포넌트.
   * 위치 확인 모달 UI(예: LocationConfirmation)를 주입할 때 사용.
   */
  renderLocationConfirmation?: (props: {
    location: { name: string; address: string; coordinates?: Coordinates };
    onConfirm: () => void;
    onCancel: () => void;
  }) => ReactNode;
}
