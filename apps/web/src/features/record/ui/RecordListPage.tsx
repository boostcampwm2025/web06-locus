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
import { convertMockRecordsToRecordListItems } from '../domain/record.mock';

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

export default function RecordListPage({
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

  // mock 데이터 사용 (기록 조회 API가 없으므로)
  const records = useMemo<RecordListItem[]>(() => {
    // propRecords가 제공된 경우 우선 사용 (테스트/스토리북용)
    if (propRecords) return propRecords;

    const result = convertMockRecordsToRecordListItems();
    return result as RecordListItem[];
  }, [propRecords]);

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
      <CategoryChips categories={categories} />

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {records.length === 0 ? (
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
