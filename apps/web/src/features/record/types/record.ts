import type { ChangeEvent } from 'react';
import type {
  Record as ApiRecord,
  SearchRecordItem,
  GraphNode,
} from '@locus/shared';
import type { GraphEdgeResponse } from '@/infra/types/connection';

/**
 * 위치 정보
 */
export interface Location {
  name: string;
  address: string;
}

/**
 * 기록 데이터
 * @property id - 기록의 publicId (API 응답의 publicId와 동일)
 */
export interface Record {
  id: string; // publicId
  text: string;
  tags: string[];
  location: Location;
  createdAt: Date;
  /** 이미지 URL 목록 (medium 등). 클러스터 바텀시트 갤러리 등에서 사용 */
  images?: string[];
}

/**
 * 기록 작성 폼 데이터
 */
export interface RecordFormData {
  title: string;
  text: string;
  tags: string[];
}

/**
 * 위치 좌표 (지도 SDK용)
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * 기록 작성 페이지 Props
 */
export interface RecordWritePageProps {
  initialLocation: Location;
  initialCoordinates?: Coordinates;
  onSave: (record: Record, coordinates?: Coordinates) => void;
  onCancel: () => void;
  onTakePhoto?: () => void;
  onSelectFromLibrary?: () => void;
}

/**
 * 이미지 선택 바텀시트 Props
 */
export interface ImageSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onSelectFromLibrary: () => void;
  /** true일 때만 "사진 촬영" 옵션 노출 (모바일 + 카메라 있을 때) */
  canTakePhoto?: boolean;
}

/**
 * 장소에 기록 추가 시 전달할 위치 정보 (위도/경도 필수)
 */
export interface LocationWithCoordinates {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

/**
 * 기록 요약 바텀시트 Props
 * record는 Record 객체 또는 publicId 문자열을 받을 수 있음
 * publicId인 경우 내부에서 API로 상세 정보를 조회함
 */
export interface RecordSummaryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record | string; // Record 객체 또는 publicId
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  /** 장소에 기록 추가 시 (record에 좌표가 있을 때만 + 버튼 표시) */
  onAddRecord?: (location: LocationWithCoordinates) => void;
  /** record가 객체일 때 좌표 전달 (savedRecord.coordinates 등) */
  recordCoordinates?: Coordinates;
}

/**
 * 클러스터(그리드) 기록 바텀시트 Props
 * 대표 1개 기록 요약 + 슬라이드업 시 해당 그리드 전체 기록 목록
 */
export interface ClusterRecordBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  topRecord: Record /** 대표 기록 (가장 최상단, 예: 최신) */;
  clusterRecords: Record[] /** 해당 그리드의 전체 기록 (topRecord 포함, 최소 1개) */;
  onRecordClick?: (
    recordId: string,
  ) => void /** 목록에서 기록 클릭 시 (상세 페이지 이동 등) */;
}

/**
 * 기록 요약 헤더 Props
 */
export interface RecordSummaryHeaderProps {
  title: string;
  date: Date | string;
  onClose: () => void;
}

/**
 * 기록 위치 카드 Props
 */
export interface RecordLocationCardProps {
  location: Location & { coordinates?: { lat: number; lng: number } };
  /** 장소에 기록 추가 시 (coordinates 있을 때만 + 버튼 표시) */
  onAddRecord?: (location: LocationWithCoordinates) => void;
}

/**
 * 기록 태그 섹션 Props
 */
export interface RecordTagsSectionProps {
  tags: string[];
}

/**
 * 기록 요약 콘텐츠 Props (RecordSummaryContent)
 * RecordLocationCard, RecordTagsSection 확장
 */
export interface RecordSummaryContentProps
  extends RecordLocationCardProps,
    RecordTagsSectionProps {
  title: string;
  date: Date | string;
  content: string;
  /** 이미지 URL 목록. 있으면 갤러리 영역 표시 */
  images?: string[];
  isDeleting: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

/**
 * 기록 작성 헤더 Props
 */
export interface RecordWriteHeaderProps {
  location: Location;
  onCancel: () => void;
}

/**
 * 기록 작성 폼 Props
 */
export interface RecordWriteFormProps {
  formData: RecordFormData;
  isAddingTag: boolean;
  newTagInput: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onTagToggle: (tag: string) => void;
  onAddTagClick: () => void;
  onTagInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onConfirmAddTag: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCancelAddTag: () => void;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  selectedImages?: File[];
  previewUrls?: string[];
  onRemoveImage?: (index: number) => void;
  isCompressing?: boolean;
  onMobileAddClick?: () => void;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
  isSaving?: boolean;
  isCreatingTag?: boolean;
}

/**
 * 기록 작성 지도 Props
 */
export interface RecordWriteMapProps {
  initialCoordinates?: Coordinates;
  currentCoordinates?: Coordinates;
  onCoordinatesChange?: (coordinates: Coordinates) => void;
}

/**
 * Naver Map 훅 옵션
 */
export interface UseNaverMapOptions {
  initialCoordinates?: Coordinates;
  zoom?: number;
  zoomControl?: boolean;
  defaultCenter?: Coordinates;
}

/**
 * 정렬 순서
 */
export type SortOrder = 'newest' | 'oldest';

/**
 * 필터 바텀시트 Props
 */
export interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sortOrder?: SortOrder;
  includeImages?: boolean;
  favoritesOnly?: boolean;
  onSortOrderChange?: (order: SortOrder) => void;
  onIncludeImagesChange?: (include: boolean) => void;
  onFavoritesOnlyChange?: (only: boolean) => void;
  onApply?: () => void;
}

/**
 * 연결된 기록 정보
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
 * 기록 상세 페이지 Props
 */
export interface RecordDetailPageProps {
  title: string;
  date: Date;
  location: Location;
  tags: string[];
  description: string;
  /** 단일 이미지 (하위 호환). imageUrls가 있으면 슬라이더로 모두 표시 */
  imageUrl?: string;
  /** 기록에 올라온 이미지 URL 목록. 있으면 슬라이더로 표시 */
  imageUrls?: string[];
  connectionCount: number;
  connectedRecords?: ConnectedRecord[];
  /** GET /records/{publicId}/graph 응답의 nodes (데스크톱 사이드패널 D3 뷰용) */
  graphNodes?: GraphNode[];
  /** GET /records/{publicId}/graph 응답의 edges (데스크톱 사이드패널 D3 뷰용) */
  graphEdges?: GraphEdgeResponse[];
  /** 현재 기록의 publicId (D3 뷰 base 노드 강조용) */
  baseRecordPublicId?: string;
  isFavorite?: boolean;
  onBack?: () => void;
  onFavoriteToggle?: () => void;
  onMenuClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onConnectionManage?: () => void;
  onConnectionMode?: () => void;
  onRecordClick?: (recordId: string) => void;
  className?: string;
}

/**
 * 연결 기록 선택 Drawer Props
 */
export interface RecordConnectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fromRecordId: string; // 출발 기록 ID (이미 선택됨)
  onConnect: (fromRecordId: string, toRecordId: string) => void;
}

/**
 * 연결 확인 다이얼로그 Props
 */
export interface ConnectionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departure: {
    id: string;
    title: string;
    location: Location;
    imageUrl?: string;
  };
  arrival: {
    id: string;
    title: string;
    location: Location;
    imageUrl?: string;
  };
  onConfirm: () => void;
  isConnecting?: boolean;
}

/**
 * 연결 헤더 Props
 */
export interface RecordConnectionHeaderProps {
  fromRecord: {
    id: string;
    title: string;
    location: Location;
  } | null;
  onCancel: () => void;
}

/**
 * 기록 즐겨찾기 변경 파라미터
 */
export interface UpdateRecordFavoriteParams {
  publicId: string;
  isFavorite: boolean;
}

/**
 * 기록 목록 데이터 (캐시용)
 */
export interface RecordsData {
  records: (ApiRecord | SearchRecordItem)[];
  totalCount?: number;
}

/**
 * 사이드바 기록 필터링 훅 Props
 */
export interface UseSidebarRecordsProps {
  sortOrder: SortOrder;
  startDate?: string;
  endDate?: string;
  favoritesOnly?: boolean; // 추가 가능성 대비
  includeImages?: boolean; // 추가 가능성 대비
  selectedCategory?: string;
  categories?: { id: string; label: string }[]; // 서버 사이드 필터링으로 변경
}

/**
 * 검색 결과 데이터
 */
export interface SearchRecordsData {
  records: SearchRecordItem[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    totalCount: number;
  };
}
