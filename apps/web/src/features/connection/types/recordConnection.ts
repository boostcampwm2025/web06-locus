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
  thumbnailImageUrl?: string; // 연결 확인 다이얼로그용 썸네일 이미지
  isRelated?: boolean; // 검색 결과에서 관련 기록인지 여부
  isConnected?: boolean; // 이미 연결된 기록인지 여부
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
  onDepartureClick: () => void;
  onArrivalClick: () => void;
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
  autoFocus?: boolean;
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
  records: RecordConnectionItem[];
  onRecordClick?: (record: RecordConnectionItem) => void;
  emptyMessage?: string;
  className?: string;
  /** 섹션 내부 스크롤 영역의 높이(있으면 스크롤 활성) */
  scrollHeight?: string; // 예: "h-[420px]" | "max-h-[60vh]" | "h-full"
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

/**
 * 선택 버튼 Props
 */
export interface SelectionButtonProps {
  label: string;
  placeholder: string;
  dotClassName: string;
  selected?: { title?: string } | null;
  onClick: () => void;
  onClear?: () => void;
  clearAriaLabel: string;
}

/**
 * 기록 선택 컨텍스트 바텀시트 Props
 */
export interface RecordSelectionContextSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordConnectionItem | null;
  onSelectDeparture: (record: RecordConnectionItem) => void;
  onSelectArrival: (record: RecordConnectionItem) => void;
}

/**
 * 액션 아이템 Props (내부 사용)
 */
export interface ActionItemProps {
  dotClassName: string;
  title: string;
  description: string;
  onClick: () => void;
  ariaLabel: string;
}
