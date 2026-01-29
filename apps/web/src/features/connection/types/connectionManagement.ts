import type { Location } from '@/features/record/types';
import type { GraphNode } from '@locus/shared';
import type { GraphEdgeResponse } from '@/infra/types/connection';

/**
 * 기준 기록 데이터
 */
export interface BaseRecord {
  id: string;
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  connectionCount: number;
}

/**
 * 연결된 기록 데이터
 */
export interface ConnectedRecord {
  id: string;
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  imageUrl?: string;
}

/**
 * 연결 관리 페이지 Props
 */
export interface ConnectionManagementPageProps {
  baseRecord: BaseRecord;
  connectedRecords: ConnectedRecord[];
  /** GET /records/{publicId}/graph 응답의 nodes (D3 네트워크 뷰용) */
  graphNodes?: GraphNode[];
  /** GET /records/{publicId}/graph 응답의 edges (D3 네트워크 뷰용) */
  graphEdges?: GraphEdgeResponse[];
  /** 기준 기록 publicId (D3 네트워크 뷰 강조용) */
  baseRecordPublicId?: string;
  onBack?: () => void;
  onSearchChange?: (value: string) => void;
  onRecordRemove?: (recordId: string) => void;
  onRecordClick?: (recordId: string) => void;
  className?: string;
}

/**
 * 기준 기록 섹션 Props
 */
export interface BaseRecordSectionProps {
  record: BaseRecord;
  className?: string;
}

/**
 * 연결 검색 입력 Props
 */
export interface ConnectionSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 연결 관계 지도 시각화 Props
 */
export interface ConnectionMapVisualizationProps {
  connectionCount: number;
  className?: string;
}

/**
 * 연결된 기록 목록 Props
 */
export interface ConnectedRecordListProps {
  records: ConnectedRecord[];
  onRecordRemove?: (recordId: string) => void;
  onRecordClick?: (recordId: string) => void;
  showEmptyMessage?: boolean;
  className?: string;
}

/**
 * 연결된 기록 카드 Props
 */
export interface ConnectedRecordCardProps {
  record: ConnectedRecord;
  onRemove?: (recordId: string) => void;
  onClick?: (recordId: string) => void;
  className?: string;
}
