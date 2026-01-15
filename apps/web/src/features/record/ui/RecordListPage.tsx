import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/shared/ui/header/AppHeader';
import CategoryChips from '@/shared/ui/category/CategoryChips';
import { RecordCard } from '@/shared/ui/record';
import BottomTabBar from '@/shared/ui/navigation/BottomTabBar';
import type { Location } from '@/features/record/types';
import type { Category } from '@/shared/types/category';
import { ROUTES } from '@/router/routes';
import { useBottomTabNavigation } from '@/shared/hooks/useBottomTabNavigation';

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

const defaultRecords: RecordListItem[] = [
  {
    id: '1',
    title: '경복궁 나들이',
    location: { name: '경복궁', address: '서울특별시 종로구 사직로 161' },
    date: new Date('2025-12-15'),
    tags: ['역사', '명소'],
    connectionCount: 3,
    imageUrl: 'https://placehold.co/80',
  },
  {
    id: '2',
    title: '한옥의 고즈넉한 분위기와 골목길이 인상적인',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길',
    },
    date: new Date('2025-12-14'),
    tags: ['문화', '명소'],
    connectionCount: 2,
    imageUrl: 'https://placehold.co/80',
  },
  {
    id: '3',
    title: '서울숲 산책',
    location: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    date: new Date('2025-12-13'),
    tags: ['자연', '공원'],
    connectionCount: 5,
  },
  {
    id: '4',
    title: '이태원 맛집 탐방',
    location: { name: '이태원', address: '서울특별시 용산구 이태원로' },
    date: new Date('2025-12-12'),
    tags: ['음식', '문화'],
    connectionCount: 1,
  },
  {
    id: '5',
    title: '명동 쇼핑',
    location: { name: '명동', address: '서울특별시 중구 명동길' },
    date: new Date('2025-12-10'),
    tags: ['쇼핑', '명소'],
    connectionCount: 4,
  },
];

export default function RecordListPage({
  records = defaultRecords,
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
      {!isSearchActive && <CategoryChips categories={categories} />}

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
