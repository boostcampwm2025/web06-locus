import type { Location } from '@/features/record/types';

/**
 * 연결용 기록 데이터
 */
export interface RecordConnectionItem {
  id: string;
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  imageUrl?: string;
  isRelated?: boolean; // 검색 결과에서 관련 기록인지 여부
}

/**
 * 출발/도착 선택 상태
 */
export interface RecordSelection {
  id: string;
  title: string;
  location: Location;
}

/**
 * 기록 연결 페이지 Props
 */
export interface RecordConnectionPageProps {
  onBack?: () => void;
  onConnect?: (departureId: string, arrivalId: string) => void;
  className?: string;
}

/**
 * 기록 선택 헤더 Props
 */
export interface RecordSelectionHeaderProps {
  departure?: RecordSelection;
  arrival?: RecordSelection;
  onDepartureClick?: () => void;
  onArrivalClick?: () => void;
  onDepartureClear?: () => void;
  onArrivalClear?: () => void;
  className?: string;
}

/**
 * 기록 검색 입력 Props
 */
export interface RecordSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 기록 연결 카드 Props
 */
export interface RecordConnectionCardProps {
  record: RecordConnectionItem;
  onClick?: () => void;
  className?: string;
}

/**
 * 추천 기록 섹션 Props
 */
export interface RecommendedRecordsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 연결하기 버튼 Props
 */
export interface ConnectActionButtonProps {
  isEnabled: boolean;
  onClick: () => void;
  disabledText?: string;
  enabledText?: string;
  className?: string;
}

/**
 * 기록 연결 리스트 Props
 */
export interface RecordConnectionListProps {
  records: RecordConnectionItem[];
  onRecordClick?: (record: RecordConnectionItem) => void;
  emptyMessage?: string;
  className?: string;
}
