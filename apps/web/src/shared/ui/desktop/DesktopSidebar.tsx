import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/ui/icons/Logo';
import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import { FilterIcon } from '@/shared/ui/icons/FilterIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { ROUTES } from '@/router/routes';
import { useGetTags } from '@/features/record/hooks/useGetTags';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import type {
  DesktopSidebarProps,
  SidebarSectionProps,
  RecordCardProps,
} from '@/shared/types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { transformRecordApiToUI } from '@/shared/utils/recordTransform';

// 한국 전체를 커버하는 넓은 bounds
const KOREA_WIDE_BOUNDS = {
  neLat: 38.6,
  neLng: 131.9,
  swLat: 33.1,
  swLng: 124.6,
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

export function DesktopSidebar({
  searchValue = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  onRecordClick,
  onCreateRecordClick,
  onSettingsClick,
  sortOrder = 'newest',
  startDate = '',
  endDate = '',
  onSortOrderChange,
  onStartDateChange,
  onEndDateChange,
  onFilterReset,
}: DesktopSidebarProps) {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 필터 패널 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        filterButtonRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isFilterOpen]);

  const { data: allTags = [] } = useGetTags();
  const { data: recordsByBoundsData, isLoading: isRecordsLoading } =
    useGetRecordsByBounds(KOREA_WIDE_BOUNDS);

  // 기록 목록 변환
  const records = useMemo(() => {
    if (!recordsByBoundsData?.records) return [];
    return recordsByBoundsData.records.map(transformRecordApiToUI);
  }, [recordsByBoundsData]);

  const handleRecordClick = (recordId: string) => {
    onRecordClick?.(recordId);
    void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
  };

  const handleCreateRecord = () => {
    onCreateRecordClick?.();
    void navigate(ROUTES.RECORD);
  };

  // 카테고리 목록 (전체 + 태그들)
  const categories = [
    { id: 'all', label: '전체' },
    ...allTags.map((tag) => ({ id: tag.publicId, label: tag.name })),
  ];

  return (
    <aside className="flex flex-col w-[420px] h-full bg-white border-r border-gray-100 shadow-2xl relative z-20">
      {/* 헤더: 로고 + 프로필 */}
      <div className="flex items-center justify-between p-8 pb-4">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <h1 className="text-gray-900 font-medium">Locus</h1>
        </div>
        <button
          type="button"
          onClick={onSettingsClick}
          className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#FE8916] hover:bg-orange-50 transition-all"
          aria-label="설정"
        >
          <UserIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 검색 바 */}
      <SidebarSection>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300" />
          <input
            type="text"
            placeholder="기록 검색..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
          />
        </div>
      </SidebarSection>

      {/* 카테고리 필터 */}
      <SidebarSection>
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange?.(category.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* 검색 결과 정보 + 필터 버튼 */}
      <SidebarSection>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            검색 결과 {records.length}
          </span>
          <div className="relative">
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FilterIcon className="w-4 h-4" />
              <span>필터</span>
            </button>

            {/* 필터 패널 */}
            {isFilterOpen && (
              <div
                ref={filterPanelRef}
                className="absolute top-full right-0 mt-2 z-30"
              >
                <DesktopFilterPanel
                  sortOrder={sortOrder}
                  startDate={startDate}
                  endDate={endDate}
                  onSortOrderChange={(order) => {
                    onSortOrderChange?.(order);
                  }}
                  onStartDateChange={(date) => {
                    onStartDateChange?.(date);
                  }}
                  onEndDateChange={(date) => {
                    onEndDateChange?.(date);
                  }}
                  onReset={() => {
                    onFilterReset?.();
                    setIsFilterOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </SidebarSection>

      {/* 기록 목록 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto px-8 pt-0 no-scrollbar relative">
        {/* 스크롤 힌트 그라데이션 */}
        <div className="sticky top-0 h-4 bg-linear-to-b from-white to-transparent pointer-events-none z-10" />
        {isRecordsLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            기록을 불러오는 중...
          </div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            기록이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => handleRecordClick(record.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 새 기록 버튼 */}
      <div className="p-8 border-t border-gray-50">
        {/* 새로운 기록 남기기 버튼 */}
        <button
          type="button"
          onClick={handleCreateRecord}
          className="w-full py-5 rounded-[24px] bg-[#FE8916] hover:bg-[#E67800] text-white font-black shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <PlusIcon className="w-6 h-6" />
          <span>새로운 기록 남기기</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  children,
  className = 'px-8 pb-4',
}: SidebarSectionProps) {
  return (
    <div className={className}>
      {title && (
        <p className="text-[#99a1af] text-[10px] font-black tracking-[1.1172px] uppercase mb-2 leading-[15px]">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

// 기록 카드 컴포넌트 (하위 컴포넌트로 분리)
function RecordCard({ record, onClick }: RecordCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-5 rounded-[24px] cursor-pointer transition-all border-2 border-transparent bg-white shadow-sm hover:border-gray-100 text-left group"
    >
      <div className="flex gap-5 items-center">
        {/* 이미지 썸네일 */}
        <div className="w-24 h-24 rounded-[20px] overflow-hidden shrink-0 relative">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={record.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 truncate">
            {record.title}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
            <LocationIcon className="w-[14px] h-[14px] text-[#73C92E]" />
            {record.location.name}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <CalendarIcon className="w-[14px] h-[14px]" />
            {formatDateShort(record.date)}
          </p>
        </div>
      </div>
    </button>
  );
}
