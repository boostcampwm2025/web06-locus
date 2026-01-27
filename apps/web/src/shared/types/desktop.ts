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
