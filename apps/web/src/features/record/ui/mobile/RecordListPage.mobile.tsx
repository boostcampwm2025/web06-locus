import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import { RecordCard } from '@/shared/ui/record';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import FilterBottomSheet from '@/features/record/ui/FilterBottomSheet';
import type { Location, SortOrder } from '@/features/record/types';
import type { Category } from '@/shared/types/category';
import { ROUTES } from '@/router/routes';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';
import { useAllRecords } from '@/features/record/hooks/useRecords';
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver';
import type { RecordWithoutCoords } from '@locus/shared';
import { extractTagNames } from '@/shared/utils/tagUtils';
import { sortRecordsByFavorite } from '@/shared/utils/recordSortUtils';

export interface RecordListItem {
  id: string;
  title: string;
  location: Location;
  date: Date;
  tags: string[];
  connectionCount: number;
  imageUrl?: string;
}

export interface RecordListPageProps {
  categories?: Category[];
  onRecordClick?: (recordId: string) => void;
  onFilterClick?: () => void;
  onSearchClick?: () => void;
  onSearchCancel?: () => void;
  onTabChange?: (tabId: 'home' | 'record') => void;
  className?: string;
}

const defaultCategories: Category[] = [
  { id: 'all', label: '전체' },
  { id: 'history', label: '역사' },
  { id: 'culture', label: '문화' },
  { id: 'attraction', label: '명소' },
  { id: 'nature', label: '자연' },
  { id: 'shopping', label: '쇼핑' },
];

export function RecordListPageMobile({
  categories = defaultCategories,
  onRecordClick,
  onFilterClick,
  onSearchClick,
  onSearchCancel,
  onTabChange,
  className = '',
}: RecordListPageProps) {
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // 필터 상태 관리
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);

  // 무한 스크롤: 표시할 아이템 수 관리
  const [displayCount, setDisplayCount] = useState(20); // 초기 표시 개수
  const ITEMS_PER_LOAD = 20; // 한 번에 추가로 표시할 개수

  // 전체 기록 조회 API 사용 (GET /records/all)
  // 좌표 없음, 리스트 뷰 전용, 클라이언트 사이드 필터링 지원
  const { data: allRecordsData, isLoading, isError } = useAllRecords();

  // API 응답을 RecordListItem으로 변환 및 필터링/정렬
  // GET /records/all API 사용 (좌표 없음, isFavorite 포함)
  const allRecords = useMemo<RecordListItem[]>(() => {
    if (!allRecordsData?.records) {
      return [];
    }

    // 필터링 적용 (클라이언트 사이드)
    let filteredRecords = allRecordsData.records;

    // 즐겨찾기 필터
    if (favoritesOnly) {
      filteredRecords = filteredRecords.filter(
        (record) => record.isFavorite === true,
      );
    }

    // 이미지 필터
    if (includeImages) {
      filteredRecords = filteredRecords.filter(
        (record) => record.images && record.images.length > 0,
      );
    }

    // 정렬 적용
    let sortedRecords: RecordWithoutCoords[];
    if (sortOrder === 'newest') {
      // 최신순: 즐겨찾기 우선 정렬 후 최신순
      sortedRecords = sortRecordsByFavorite(filteredRecords);
    } else {
      // 오래된순: 즐겨찾기 우선 정렬 후 오래된순
      const favoriteFirst = sortRecordsByFavorite(filteredRecords);
      sortedRecords = [...favoriteFirst].reverse();
    }

    // 정렬된 API 응답을 RecordListItem으로 변환
    // RecordWithoutCoords는 좌표 없음 (name, address만), isFavorite와 connectionCount 포함
    return sortedRecords.map((record: RecordWithoutCoords) => {
      // 이미지가 있는 경우 첫 번째 이미지의 thumbnail URL 사용
      const thumbnailUrl =
        record.images && record.images.length > 0
          ? record.images[0].thumbnail.url
          : undefined;

      return {
        id: record.publicId,
        title: record.title,
        location: {
          name: record.location.name ?? '',
          address: record.location.address ?? '',
        },
        date: new Date(record.createdAt),
        tags: extractTagNames(record.tags),
        connectionCount: record.connectionCount,
        imageUrl: thumbnailUrl,
      };
    });
  }, [allRecordsData, sortOrder, favoritesOnly, includeImages]);

  // 무한 스크롤: 표시할 레코드만 선택
  const records = useMemo(() => {
    return allRecords.slice(0, displayCount);
  }, [allRecords, displayCount]);

  // 필터 변경 시 표시 개수 리셋
  const hasMore = displayCount < allRecords.length;

  // 무한 스크롤: 더 많은 아이템 로드
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setDisplayCount((prev) => prev + ITEMS_PER_LOAD);
    }
  }, [isLoading, hasMore]);

  // Intersection Observer로 무한 스크롤 구현
  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: '200px',
    threshold: 0.1,
    enabled: hasMore && !isLoading,
  });

  const handleSearchClick = () => {
    setIsSearchActive(true);
    onSearchClick?.();
  };

  const handleSearchCancel = () => {
    setIsSearchActive(false);
    setSearchValue('');
    onSearchCancel?.();
  };

  const handleRecordClick = (recordId: string) => {
    onRecordClick?.(recordId);
    void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
  };

  const { handleTabChange: handleTabChangeNavigation } =
    useBottomTabNavigation();

  const handleTabChange = (tabId: 'home' | 'record') => {
    onTabChange?.(tabId);
    handleTabChangeNavigation(tabId);
  };

  const handleTitleClick = () => {
    void navigate(ROUTES.HOME);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
    onFilterClick?.();
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handleFilterApply = () => {
    // 필터 적용 로직은 useMemo에서 처리됨
    setIsFilterOpen(false);
  };

  return (
    <div
      className={`flex flex-col min-h-screen h-full bg-white overflow-hidden ${className}`}
    >
      {/* 헤더 */}
      <AppHeader
        onTitleClick={handleTitleClick}
        onFilterClick={handleFilterClick}
        onSearchClick={handleSearchClick}
        isSearchActive={isSearchActive}
        searchPlaceholder="키워드, 장소, 태그 검색"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchCancel={handleSearchCancel}
      />

      {/* 필터 바 */}
      <div className="pt-[72px]">
        <CategoryChips categories={categories} />
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-[72px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            기록을 불러오는 중...
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center text-red-400">
            기록을 불러오는데 실패했습니다.
          </div>
        ) : records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            기록이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                title={record.title}
                location={record.location}
                date={record.date}
                tags={record.tags}
                connectionCount={record.connectionCount}
                imageUrl={record.imageUrl}
                onClick={() => handleRecordClick(record.id)}
              />
            ))}
            {/* 무한 스크롤 트리거 */}
            {hasMore && (
              <div
                ref={targetRef}
                className="h-4 flex items-center justify-center"
              >
                <div className="text-xs text-gray-400">더 불러오는 중...</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 바텀 탭 */}
      <BottomTabBar activeTab="record" onTabChange={handleTabChange} />

      {/* 필터 바텀시트 */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        sortOrder={sortOrder}
        favoritesOnly={favoritesOnly}
        includeImages={includeImages}
        onSortOrderChange={setSortOrder}
        onFavoritesOnlyChange={setFavoritesOnly}
        onIncludeImagesChange={setIncludeImages}
        onApply={handleFilterApply}
      />
    </div>
  );
}
