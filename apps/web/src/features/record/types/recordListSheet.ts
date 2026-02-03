/**
 * 연결 요약 바텀시트(플로팅 카드형)에 표시할 데이터
 */
export interface SummaryBottomSheetData {
  title: string;
  time: string;
  tags: string[];
  connectedCount: number;
}

/**
 * 연결 요약 바텀시트 Props (모바일, 플로팅 카드형)
 */
export interface SummaryBottomSheetProps {
  isVisible: boolean;
  data: SummaryBottomSheetData;
  onExpand: () => void;
  onClose: () => void;
}

/**
 * 슬라이드업 리스트 내 기록 카드 Props
 */
export interface RecordListCardProps {
  title: string;
  description: string;
  date: string;
  location: string;
  tags: string[];
  connections?: number;
  isSelected?: boolean;
  onViewDetail: () => void;
}

/**
 * RecordListView에서 사용하는 "현재 대표 기록" 데이터
 */
export interface RecordListMainRecord {
  title: string;
  location: string;
  date: string;
  tags: string[];
}

/**
 * RecordListView에 전달하는 기록 아이템 (RecordCard와 호환)
 */
export type RecordListItem = Omit<
  RecordListCardProps,
  'isSelected' | 'onViewDetail'
>;

/**
 * 기록 리스트 뷰(슬라이드업 전체 화면) Props
 */
export interface RecordListViewProps {
  isVisible: boolean;
  currentMainRecord: RecordListMainRecord;
  currentTab: 'records' | 'connections';
  bukhansanRecords: RecordListItem[];
  connectionRecords: RecordListItem[];
  activeRecordIndex: number;
  activeConnectionIndex: number;
  onBack: () => void;
  onTabChange: (tab: 'records' | 'connections') => void;
  onRecordSelect: (index: number) => void;
  onViewDetail: () => void;
}
