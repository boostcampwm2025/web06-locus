import type { SortOrder } from '@/features/record/types';
import type { UIRecord } from '@/shared/utils/recordTransform';

/**
 * Desktop Calendar 컴포넌트 Props
 */
export interface DesktopCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

/**
 * Desktop Filter Panel 컴포넌트 Props
 */
export interface DesktopFilterPanelProps {
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
  onSortOrderChange?: (sortOrder: SortOrder) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onReset?: () => void;
}

/**
 * Desktop Sidebar 컴포넌트 Props
 */
export interface DesktopSidebarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onRecordClick?: (recordId: string) => void;
  onCreateRecordClick?: () => void;
  /** 단일 장소 핀 선택 시, 해당 장소로 기록 작성 */
  onCreateRecordAtLocation?: (
    location: { name: string; address: string },
    coordinates: { lat: number; lng: number },
  ) => void;
  onSettingsClick?: () => void;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
  onSortOrderChange?: (sortOrder: SortOrder) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onFilterReset?: () => void;
  selectedRecordId?: string | null;
  onRecordSelect?: (recordId: string | null) => void;
  onOpenFullDetail?: (recordId: string) => void;
  onStartConnection?: (recordId: string) => void;
  /** 지도 핀 클릭 시 해당 위치 기록 ID 목록 (데스크톱: 바텀시트 대신 사이드바에 목록 표시) */
  pinSelectedRecordIds?: string[] | null;
  /** 단일 장소 핀 선택 시 location+coordinates (새로운 기록 남기기 버튼 노출용) */
  pinSelectedLocationWithCoords?: {
    location: { name: string; address: string };
    coordinates: { lat: number; lng: number };
  } | null;
  /** 핀 선택 시 표시할 기록 목록 (API 반영 전 생성 기록 등, 없으면 allRecords에서 pinSelectedRecordIds로 필터) */
  pinSelectedRecordsOverride?:
    | (UIRecord & {
        connectionCount?: number;
      })[]
    | null;
  onClearPinSelection?: () => void;
  // 연결 모드 데이터 (RecordConnectionDrawer에서 전달)
  connectionModeData?: {
    records: {
      id: string;
      title: string;
      location: { name: string; address: string };
      date: Date;
      tags: string[];
      imageUrl?: string;
    }[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onRecordClick: (recordId: string) => void;
    fromRecordId: string;
    arrivalId?: string;
  };
}

/**
 * Desktop Filter Field 컴포넌트 Props
 */
export interface FilterFieldProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

/**
 * Desktop Sort Order Button 컴포넌트 Props
 */
export interface SortOrderButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Desktop Sidebar Section 컴포넌트 Props
 */
export interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Desktop Record Card 컴포넌트 Props
 */
export interface RecordCardProps {
  record: UIRecord;
  onClick: () => void;
}

/**
 * Desktop Connection Graph CTA 컴포넌트 Props
 */
export interface ConnectionGraphCTAProps {
  connectionCount: number;
  onOpenGraph: () => void;
}

/**
 * Desktop Connected Records Section 컴포넌트 Props
 */
export interface ConnectedRecordsSectionProps {
  connectedRecords: {
    id: string;
    title: string;
    location: { name: string; address: string };
    date: Date;
    tags: string[];
    imageUrl?: string;
  }[];
  onConnectionManage?: () => void;
  onRecordClick?: (recordId: string) => void;
}

/**
 * Desktop Record Summary Panel 컴포넌트 Props
 */
export interface RecordSummaryPanelProps {
  recordId: string;
  onBack: () => void;
  onOpenFullDetail: () => void;
  onStartConnection: () => void;
}
