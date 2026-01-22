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
}

/**
 * 기록 요약 바텀시트 Props
 */
export interface RecordSummaryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 기록 요약 헤더 Props
 */
export interface RecordSummaryHeaderProps {
  title: string;
  date: Date;
  onClose: () => void;
}

/**
 * 기록 위치 카드 Props
 */
export interface RecordLocationCardProps {
  location: Location;
}

/**
 * 기록 태그 섹션 Props
 */
export interface RecordTagsSectionProps {
  tags: string[];
}

/**
 * 기록 작성 헤더 Props
 */
export interface RecordWriteHeaderProps {
  location: Location;
  onCancel: () => void;
}

import type { ChangeEvent } from 'react';

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
  onCancelAddTag: () => void;
  onAddImage: () => void;
  selectedImages?: File[];
  onRemoveImage?: (index: number) => void;
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
 * 기록 상세 페이지 Props
 */
export interface RecordDetailPageProps {
  title: string;
  date: Date;
  location: Location;
  tags: string[];
  description: string;
  imageUrl?: string;
  connectionCount: number;
  isFavorite?: boolean;
  onBack?: () => void;
  onFavoriteToggle?: () => void;
  onMenuClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onConnectionManage?: () => void;
  onConnectionMode?: () => void;
  className?: string;
}
