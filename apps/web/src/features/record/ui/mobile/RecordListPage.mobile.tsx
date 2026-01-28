import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import { RecordCard } from '@/shared/ui/record';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import type { Location } from '@/features/record/types';
import type { Category } from '@/shared/types/category';
import { ROUTES } from '@/router/routes';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import type { Record as ApiRecord } from '@locus/shared';

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
  records?: RecordListItem[];
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

// 한국 전체를 커버하는 넓은 bounds (임시로 전체 기록 조회용)
const KOREA_WIDE_BOUNDS = {
  neLat: 38.6, // 북한 포함
  neLng: 131.9, // 동해
  swLat: 33.1, // 제주도 남쪽
  swLng: 124.6, // 서해
  page: 1,
  limit: 100, // 충분히 많은 기록 가져오기
  sortOrder: 'desc' as const,
};

export function RecordListPageMobile({
  records: propRecords,
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

  // API에서 기록 목록 가져오기 (넓은 bounds 사용)
  const {
    data: recordsByBoundsData,
    isLoading,
    isError,
  } = useGetRecordsByBounds(KOREA_WIDE_BOUNDS);

  // API 응답을 RecordListItem으로 변환
  const records = useMemo<RecordListItem[]>(() => {
    // propRecords가 제공된 경우 우선 사용 (테스트/스토리북용)
    if (propRecords) return propRecords;

    if (!recordsByBoundsData?.records) {
      return [];
    }

    return recordsByBoundsData.records.map((record: ApiRecord) => {
      // 이미지가 있는 경우 첫 번째 이미지의 thumbnail URL 사용
      const recordWithImages = record as ApiRecord & {
        images?: {
          thumbnail: { url: string };
          medium: { url: string };
          original: { url: string };
        }[];
      };
      const thumbnailUrl =
        recordWithImages.images && recordWithImages.images.length > 0
          ? recordWithImages.images[0].thumbnail.url
          : undefined;

      return {
        id: record.publicId,
        title: record.title,
        location: {
          name: record.location.name ?? '',
          address: record.location.address ?? '',
        },
        date: new Date(record.createdAt),
        tags: record.tags,
        connectionCount: 0, // TODO: 연결 개수 API 연동 필요
        imageUrl: thumbnailUrl,
      };
    });
  }, [propRecords, recordsByBoundsData]);

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

  return (
    <div
      className={`flex flex-col min-h-screen h-full bg-white overflow-hidden ${className}`}
    >
      {/* 헤더 */}
      <AppHeader
        onTitleClick={handleTitleClick}
        onFilterClick={onFilterClick}
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
          </div>
        )}
      </div>

      {/* 바텀 탭 */}
      <BottomTabBar activeTab="record" onTabChange={handleTabChange} />
    </div>
  );
}
