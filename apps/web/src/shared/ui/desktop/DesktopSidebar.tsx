import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Logo } from '@/shared/ui/icons/Logo';
import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import { FilterIcon } from '@/shared/ui/icons/FilterIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { UserIcon } from '@/shared/ui/icons/UserIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import { LinkIcon } from '@/shared/ui/icons/LinkIcon';
import { FavoriteIcon } from '@/shared/ui/icons/FavoriteIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import { ImageSkeleton } from '@/shared/ui/skeleton';
import { RecordImageSlider } from '@/shared/ui/record';
import { useScrollPosition } from '@/shared/hooks/useScrollPosition';
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver';
import { ROUTES } from '@/router/routes';
import { useGetTags } from '@/features/record/hooks/useGetTags';
import { useSidebarRecords } from '@/features/record/hooks/useSidebarRecords';
import { useSearchRecords } from '@/features/record/hooks/useSearchRecords';
import { useGetRecordDetail } from '@/features/record/hooks/useGetRecordDetail';
import { useUpdateRecordFavorite } from '@/features/record/hooks/useUpdateRecordFavorite';
import { useDeleteRecord } from '@/features/record/hooks/useDeleteRecord';
import { useConnectionStore } from '@/features/connection/domain/connectionStore';
import { useToast } from '@/shared/ui/toast';
import { useConnectionModeData } from '@/features/connection/hooks/useConnectionModeData';
import { useRecordGraphDetails } from '@/features/connection/hooks/useRecordGraphDetails';
import { ConfirmModal } from '@/features/settings/ui/desktop/modals/ConfirmModal';
import { useBlobPreviewStore } from '@/features/record/domain/blobPreviewStore';
import { DesktopFilterPanel } from './DesktopFilterPanel';
import type {
  DesktopSidebarProps,
  SidebarSectionProps,
  RecordCardProps,
  RecordSummaryPanelProps,
} from '@/shared/types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { logger } from '@sentry/react';

export function DesktopSidebar({
  searchValue = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  onRecordClick,
  onCreateRecordAtLocation,
  pinSelectedLocationWithCoords,
  onSettingsClick,
  sortOrder = 'newest',
  startDate = '',
  endDate = '',
  onSortOrderChange,
  onStartDateChange,
  onEndDateChange,
  onFilterReset,
  selectedRecordId = null,
  onRecordSelect,
  onOpenFullDetail,
  onStartConnection,
  pinSelectedRecordIds = null,
  pinSelectedRecordsOverride = null,
  onClearPinSelection,
}: DesktopSidebarProps) {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치 보존 (요약 패널에서 목록으로 돌아올 때 복원)
  const { scrollRef: listScrollRef, scrollProps: listScrollProps } =
    useScrollPosition(!selectedRecordId);

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

  // 연결 모드 상태 확인
  const connectionFromRecordId = useConnectionStore(
    (state) => state.connectionFromRecordId,
  );
  const handleConnectionRecordClick = useConnectionStore(
    (state) => state.handleRecordClick,
  );
  const updateSearchQuery = useConnectionStore(
    (state) => state.updateSearchQuery,
  );
  const arrival = useConnectionStore((state) => state.arrival);

  // 연결 모드일 때는 useConnectionModeData 사용
  const connectionModeData = useConnectionModeData();

  // 연결 모드일 때 기준 기록(connectionFromRecordId)과 이미 연결된 기록 ID 집합
  const { data: connectionGraphDetails } = useRecordGraphDetails(
    connectionFromRecordId,
    { enabled: !!connectionFromRecordId },
  );
  const connectedRecordIds = useMemo(
    () =>
      new Set(
        connectionGraphDetails?.data?.records?.map((r) => r.publicId) ?? [],
      ),
    [connectionGraphDetails?.data?.records],
  );

  // 카테고리 목록 (전체 + 태그들)
  const categories = useMemo(
    () => [
      { id: 'all', label: '전체' },
      ...allTags.map((tag) => ({ id: tag.publicId, label: tag.name })),
    ],
    [allTags],
  );

  // 무한 스크롤: 표시할 아이템 수 관리
  const [displayCount, setDisplayCount] = useState(20); // 초기 표시 개수
  const ITEMS_PER_LOAD = 20; // 한 번에 추가로 표시할 개수

  // 필터 변경 시 표시 개수 리셋
  useEffect(() => {
    setDisplayCount(20);
  }, [sortOrder, startDate, endDate, selectedCategory, searchValue]);

  // 검색어가 있을 때는 검색 API 사용, 없을 때는 일반 목록 사용
  const hasSearchKeyword = searchValue.trim().length > 0;
  const { data: searchData, isLoading: isSearchLoading } = useSearchRecords(
    searchValue,
    {
      enabled: !connectionFromRecordId && hasSearchKeyword,
    },
  );

  // 일반 모드일 때는 useSidebarRecords 사용 (검색어가 없을 때만)
  const {
    records: allSidebarRecords,
    totalCount: sidebarTotalCount,
    isLoading: isRecordsLoading,
  } = useSidebarRecords({
    sortOrder,
    startDate,
    endDate,
    selectedCategory,
    categories,
  });

  // 기록 목록 변환 (연결 모드 vs 검색 모드 vs 일반 모드)
  const allRecords = useMemo(() => {
    if (connectionFromRecordId) {
      // 연결 모드: connectionModeData의 records 사용
      return connectionModeData.records.map((record) => ({
        id: record.id,
        title: record.title,
        location: record.location,
        date: record.date,
        tags: record.tags,
        imageUrl: record.imageUrl,
        connectionCount: 0, // TODO: 실제 연결 개수 계산
      }));
    }
    if (hasSearchKeyword && searchData) {
      // 검색 모드: 검색 API 결과 사용
      return searchData.records.map((record) => ({
        id: String(record.recordId), // 명시적으로 string으로 변환
        title: record.title,
        location: {
          name: record.locationName ?? '',
          address: record.locationAddress ?? '',
        },
        date: new Date(record.createdAt),
        tags: record.tags,
        imageUrl: record.thumbnailImage ?? undefined,
        connectionCount: record.connectionCount,
      }));
    }
    // 일반 모드: useSidebarRecords에서 필터링/정렬된 records 사용
    return allSidebarRecords;
  }, [
    connectionFromRecordId,
    connectionModeData.records,
    allSidebarRecords,
    hasSearchKeyword,
    searchData,
  ]);

  // 로딩 상태 통합
  const isRecordsLoadingCombined = connectionFromRecordId
    ? false
    : hasSearchKeyword
      ? isSearchLoading
      : isRecordsLoading;

  // 핀 선택 시 해당 기록만 필터링 (override가 있으면 사용, 없으면 allRecords에서 필터)
  const filteredRecords = useMemo(() => {
    if (pinSelectedRecordIds && pinSelectedRecordIds.length > 0) {
      if (pinSelectedRecordsOverride && pinSelectedRecordsOverride.length > 0) {
        return pinSelectedRecordsOverride.map((r) => ({
          ...r,
          connectionCount: r.connectionCount ?? 0,
        }));
      }
      const idSet = new Set(pinSelectedRecordIds);
      return allRecords.filter((r) => idSet.has(r.id));
    }
    return allRecords;
  }, [allRecords, pinSelectedRecordIds, pinSelectedRecordsOverride]);

  // 무한 스크롤: 표시할 레코드만 선택 (핀 선택 모드에서는 전체 표시)
  const records = useMemo(() => {
    if (pinSelectedRecordIds && pinSelectedRecordIds.length > 0) {
      return filteredRecords;
    }
    return filteredRecords.slice(0, displayCount);
  }, [filteredRecords, displayCount, pinSelectedRecordIds]);

  // 무한 스크롤: 더 많은 아이템이 있는지 확인 (핀 선택 모드에서는 더보기 없음)
  const hasMore =
    !(pinSelectedRecordIds && pinSelectedRecordIds.length > 0) &&
    displayCount < filteredRecords.length;

  // 헤더에 표시할 총 개수 (API totalCount 사용, 핀 선택 시에만 현재 표시 개수)
  const displayTotalCount =
    pinSelectedRecordIds && pinSelectedRecordIds.length > 0
      ? records.length
      : hasSearchKeyword
        ? (searchData?.pagination?.totalCount ?? records.length)
        : (sidebarTotalCount ?? records.length);

  // 무한 스크롤: 더 많은 아이템 로드
  const loadMore = useCallback(() => {
    if (!isRecordsLoadingCombined && hasMore) {
      setDisplayCount((prev) => prev + ITEMS_PER_LOAD);
    }
  }, [isRecordsLoadingCombined, hasMore]);

  // Intersection Observer로 무한 스크롤 구현
  // 검색 모드일 때는 검색 API의 pagination을 사용해야 하므로 무한 스크롤 비활성화
  const { targetRef: infiniteScrollRef } = useIntersectionObserver({
    onIntersect: loadMore,
    rootMargin: '200px',
    threshold: 0.1,
    enabled:
      hasMore &&
      !isRecordsLoadingCombined &&
      !connectionFromRecordId &&
      !hasSearchKeyword,
  });

  // 연결 모드일 때 검색어는 connectionModeData의 searchQuery 사용
  const effectiveSearchValue = connectionFromRecordId
    ? connectionModeData.searchQuery
    : searchValue;

  const effectiveOnSearchChange = connectionFromRecordId
    ? updateSearchQuery
    : onSearchChange;

  const handleRecordClick = (recordId: string) => {
    if (connectionFromRecordId) {
      // 연결 모드: store의 handleConnectionRecordClick 사용
      const record = connectionModeData.records.find((r) => r.id === recordId);
      if (record) {
        handleConnectionRecordClick(record);
      }
    } else if (onRecordSelect) {
      // 요약 패널로 전환 (스크롤 위치는 useScrollPosition 훅에서 자동으로 저장됨)
      onRecordSelect(recordId);
    } else {
      // 기존 동작: 상세 페이지로 이동
      onRecordClick?.(recordId);
      void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
    }
  };

  // 연결 모드일 때 기록 클릭 핸들러 (연결하기 버튼용)
  const handleConnectClick = (recordId: string) => {
    const record = connectionModeData.records.find((r) => r.id === recordId);
    if (record) {
      handleConnectionRecordClick(record);
    }
  };

  const handleCreateRecord = () => {
    if (!pinSelectedLocationWithCoords || !onCreateRecordAtLocation) return;
    onCreateRecordAtLocation(
      pinSelectedLocationWithCoords.location,
      pinSelectedLocationWithCoords.coordinates,
    );
  };

  // 단일 장소 핀 선택 시에만 버튼 표시 (클러스터 핀 X)
  const showAddRecordButton = Boolean(
    pinSelectedLocationWithCoords && onCreateRecordAtLocation,
  );

  return (
    <aside className="flex flex-col w-[420px] h-full bg-white border-r border-gray-100 shadow-2xl relative z-20">
      {/* 사이드바 전체 콘텐츠 (헤더 포함 전체 전환) */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          {!selectedRecordId ? (
            <motion.div
              key="list"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex flex-col h-full"
            >
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
                    value={effectiveSearchValue}
                    onChange={(e) => effectiveOnSearchChange?.(e.target.value)}
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

              {/* 핀 선택 시 전체 보기 버튼 */}
              {pinSelectedRecordIds && pinSelectedRecordIds.length > 0 && (
                <SidebarSection className="px-8 pb-2">
                  <button
                    type="button"
                    onClick={onClearPinSelection}
                    className="flex items-center gap-2 text-sm text-[#FE8916] font-medium hover:underline"
                  >
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    전체 목록 보기
                  </button>
                </SidebarSection>
              )}

              {/* 검색 결과 정보 + 필터 버튼 */}
              <SidebarSection>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {pinSelectedRecordIds && pinSelectedRecordIds.length > 0
                      ? `기록 목록 ${displayTotalCount}`
                      : `기록 목록 ${displayTotalCount}`}
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
              <div
                ref={listScrollRef}
                className="flex-1 overflow-y-auto px-8 pt-0 no-scrollbar relative"
                {...listScrollProps}
              >
                {/* 스크롤 힌트 그라데이션 */}
                <div className="sticky top-0 h-4 bg-linear-to-b from-white to-transparent pointer-events-none z-10" />
                {isRecordsLoadingCombined ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {hasSearchKeyword ? '검색 중...' : '기록을 불러오는 중...'}
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
                        isConnectionMode={!!connectionFromRecordId}
                        isSource={connectionFromRecordId === record.id}
                        isSelected={arrival?.id === record.id}
                        isConnected={
                          !!connectionFromRecordId &&
                          connectedRecordIds.has(record.id)
                        }
                        onConnectClick={
                          connectionFromRecordId
                            ? () => handleConnectClick(record.id)
                            : undefined
                        }
                      />
                    ))}
                    {/* 무한 스크롤 트리거 */}
                    {hasMore && !connectionFromRecordId && (
                      <div
                        ref={infiniteScrollRef}
                        className="h-4 flex items-center justify-center py-4"
                      >
                        <div className="text-xs text-gray-400">
                          더 불러오는 중...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 하단 새 기록 버튼 (단일 장소 핀 선택 시에만 표시) */}
              {showAddRecordButton && (
                <div className="p-8 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={handleCreateRecord}
                    className="w-full py-5 rounded-[24px] bg-[#FE8916] hover:bg-[#E67800] text-white font-black shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <PlusIcon className="w-6 h-6" />
                    <span>새로운 기록 남기기</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <RecordSummaryPanel
              key="summary"
              recordId={selectedRecordId ?? ''}
              onBack={() => onRecordSelect?.(null)}
              onOpenFullDetail={() => {
                if (selectedRecordId) {
                  onOpenFullDetail?.(selectedRecordId);
                }
              }}
              onStartConnection={() => {
                if (selectedRecordId) {
                  // 연결 모드로 전환: 요약 패널 닫고 리스트로 이동
                  onRecordSelect?.(null);
                  onStartConnection?.(selectedRecordId);
                }
              }}
            />
          )}
        </AnimatePresence>
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
function RecordCard({
  record,
  onClick,
  onConnectClick,
  isConnectionMode = false,
  isSource = false,
  isSelected = false,
  isConnected = false,
}: RecordCardProps & {
  onConnectClick?: () => void;
  isConnectionMode?: boolean;
  isSource?: boolean;
  isSelected?: boolean;
  isConnected?: boolean;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 첫 번째 Blob URL 조회 (기록 생성 직후, 단일 썸네일용)
  const getBlobUrls = useBlobPreviewStore((state) => state.getBlobUrls);
  const blobUrls = getBlobUrls(record.id);

  // 이미지 URL 우선순위: 첫 번째 Blob URL → imageUrl → Placeholder
  const imageSrc = blobUrls[0] ?? record.imageUrl ?? RECORD_PLACEHOLDER_IMAGE;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-5 rounded-[24px] cursor-pointer transition-all border-2 bg-white shadow-sm text-left group ${
        isSelected
          ? 'border-[#FE8916] ring-4 ring-orange-500/5'
          : isConnectionMode && !isSource
            ? 'hover:border-orange-400 ring-4 ring-orange-500/5 border-transparent'
            : isSource
              ? 'opacity-60 cursor-default border-dashed border-gray-200'
              : 'border-transparent hover:border-gray-100'
      }`}
    >
      <div className="flex gap-5 items-center">
        {/* 이미지 썸네일 - 없으면 기본 이미지 */}
        <div className="w-24 h-24 flex justify-center items-center rounded-[20px] overflow-hidden shrink-0 relative">
          {!imageError ? (
            <>
              {imageLoading && <ImageSkeleton className="absolute inset-0" />}
              <img
                src={imageSrc}
                alt={record.title}
                className={`max-w-full max-h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
              {isConnectionMode && !isSource && (
                <div className="absolute inset-0 bg-orange-600/10 flex items-center justify-center">
                  <div className="bg-white rounded-full p-2 shadow-sm border border-gray-200">
                    <LinkIcon className="w-5 h-5 text-[#FE8916]" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <ImageSkeleton className="w-full h-full" />
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-lg font-black text-gray-900 leading-tight truncate flex-1 min-w-0">
              {record.title}
            </h3>
            {record.isFavorite && (
              <FavoriteIcon
                className="w-5 h-5 shrink-0 text-yellow-500 fill-yellow-500"
                aria-label="즐겨찾기"
              />
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
            <LocationIcon className="w-[14px] h-[14px] text-[#73C92E]" />
            {record.location.name?.trim() ||
              record.location.address?.trim() ||
              '장소 없음'}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <CalendarIcon className="w-[14px] h-[14px]" />
            {formatDateShort(record.date)}
          </p>
          {(record.connectionCount ?? 0) > 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <LinkIcon className="w-[14px] h-[14px]" />
              연결 {record.connectionCount ?? 0}개
            </p>
          )}
          {isConnectionMode && !isSource && isConnected && (
            <p className="mt-3 bg-[#5828DA] text-white px-5 py-2 rounded-full text-[10px] font-black w-fit uppercase hover:bg-[#4a20bf] transition-colors">
              이미 연결됨
            </p>
          )}
          {isConnectionMode && !isSource && !isConnected && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConnectClick?.();
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 bg-[#FE8916] text-white px-5 py-2 rounded-full text-[10px] font-black w-fit uppercase hover:bg-[#E67800] transition-colors"
            >
              연결하기
            </motion.button>
          )}
        </div>
      </div>
    </button>
  );
}

// 기록 요약 패널 컴포넌트
function RecordSummaryPanel({
  recordId,
  onBack,
  onOpenFullDetail,
  onStartConnection,
}: RecordSummaryPanelProps) {
  const [isDeleteRecordConfirmOpen, setIsDeleteRecordConfirmOpen] =
    useState(false);
  const {
    data: recordDetail,
    isLoading,
    isError,
  } = useGetRecordDetail(recordId, { enabled: !!recordId });
  const updateFavoriteMutation = useUpdateRecordFavorite();
  const deleteRecordMutation = useDeleteRecord();
  const { showToast } = useToast();

  // 모든 Blob URL 조회 (기록 생성 직후 모든 이미지)
  const getBlobUrl = useBlobPreviewStore((state) => state.getBlobUrls);

  if (isLoading) {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center justify-center h-full text-gray-400 text-sm"
      >
        기록을 불러오는 중...
      </motion.div>
    );
  }

  if (isError || !recordDetail) {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center justify-center h-full text-gray-400 text-sm"
      >
        기록을 불러올 수 없습니다.
      </motion.div>
    );
  }

  const tags = recordDetail.tags?.map((tag) => tag.name) ?? [];

  // 모든 Blob URL 사용 (기록 생성 직후 모든 이미지)
  const blobUrls = getBlobUrl(recordDetail.publicId);

  // 이미지 URL 목록 (Blob URL → medium → thumbnail → original 순으로 fallback)
  const list = recordDetail.images ?? [];
  const imageUrls = list
    .map((img, index) => {
      // 해당 인덱스에 Blob URL이 있으면 우선 사용
      if (index < blobUrls.length && blobUrls[index]) {
        logger.warn(
          `[RecordSummaryPanel] Using Blob URL for image ${index + 1}`,
        );
        return blobUrls[index];
      }

      // 나머지는 기존 로직
      const url = img.medium?.url ?? img.thumbnail?.url ?? img.original?.url;
      return url;
    })
    .filter((url): url is string => Boolean(url));
  const imageUrl =
    imageUrls.length > 0 ? imageUrls[0] : RECORD_PLACEHOLDER_IMAGE;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      className="flex flex-col h-full relative"
    >
      {/* 헤더 */}
      <div className="flex-none p-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
        >
          <ChevronRightIcon className="w-6 h-6 rotate-180" />
        </button>
        <h2 className="text-lg font-black text-gray-900">기록 요약</h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!recordId || updateFavoriteMutation.isPending) return;
              const nextFavorite = !recordDetail?.isFavorite;
              updateFavoriteMutation
                .mutateAsync({
                  publicId: recordId,
                  isFavorite: nextFavorite,
                })
                .then(() => {
                  showToast({
                    variant: 'success',
                    message: nextFavorite
                      ? '즐겨찾기에 추가되었습니다.'
                      : '즐겨찾기에서 제거되었습니다.',
                  });
                })
                .catch(() => {
                  showToast({
                    variant: 'error',
                    message: '즐겨찾기 변경에 실패했습니다.',
                  });
                });
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={
              recordDetail?.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'
            }
          >
            <FavoriteIcon
              className={`w-6 h-6 ${
                recordDetail?.isFavorite
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteRecordConfirmOpen(true)}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="삭제"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteRecordConfirmOpen}
        icon={TrashIcon}
        title="기록을 삭제할까요?"
        description="삭제한 기록은 다시 복구할 수 없습니다."
        confirmLabel="삭제 확정"
        cancelLabel="취소"
        onConfirm={() => {
          if (!recordId) return;
          setIsDeleteRecordConfirmOpen(false);
          deleteRecordMutation.mutate(recordId, {
            onSuccess: () => {
              onBack();
              showToast({
                variant: 'success',
                message: '기록이 삭제되었습니다.',
              });
            },
            onError: () => {
              showToast({ variant: 'error', message: '삭제에 실패했습니다.' });
            },
          });
        }}
        onCancel={() => setIsDeleteRecordConfirmOpen(false)}
      />

      {/* 스크롤 영역 */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0 h-full">
        {/* 이미지 - 1장 이상이면 슬라이더(이전/다음 버튼·인디케이터), 0장이면 플레이스홀더 */}
        <div className="shrink-0 flex item-center justify-center w-full min-h-[200px] relative bg-gray-100">
          {imageUrls.length > 0 ? (
            <RecordImageSlider
              urls={imageUrls}
              alt={recordDetail.title}
              className="rounded-none"
            />
          ) : (
            <>
              <ImageSkeleton className="absolute inset-0 z-0" />
              <img
                src={imageUrl}
                alt={recordDetail.title}
                className="w-auto max-w-full h-auto max-h-[300px] object-cover group-hover:scale-105 transition-all duration-700 relative z-10"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const skeleton = img.previousElementSibling as HTMLElement;
                  if (skeleton) {
                    skeleton.style.opacity = '0';
                    setTimeout(() => skeleton.remove(), 300);
                  }
                }}
                onError={(e) => {
                  e.currentTarget.style.opacity = '0';
                }}
              />
            </>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-black text-[#FE8916] bg-orange-50 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
              {recordDetail.title}
            </h1>

            {/* 위치 및 날짜 + 연결하기 버튼 그룹 */}
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex-1 min-w-0 space-y-2">
                {/* 위치 */}
                <div className="flex items-center gap-2 text-gray-500">
                  <LocationIcon className="w-[14px] h-[14px] text-[#73C92E] shrink-0" />
                  <span className="text-sm font-bold text-gray-700 truncate">
                    {recordDetail.location.name?.trim() ??
                      recordDetail.location.address?.trim() ??
                      '장소 없음'}
                  </span>
                </div>
                {/* 날짜 */}
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarIcon className="w-[14px] h-[14px] shrink-0" />
                  <span className="text-xs font-medium">
                    {formatDateShort(new Date(recordDetail.createdAt))}
                  </span>
                </div>
              </div>

              {/* 연결하기 버튼: 우측 하단 정렬 */}
              <button
                type="button"
                onClick={onStartConnection}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-[#FE8916] text-[11px] font-black hover:bg-orange-100 transition-all border border-orange-100/50 active:scale-95"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                연결하기
              </button>
            </div>
          </div>

          {/* 기록 메모 */}
          <div className="mb-10 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
              기록 메모
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm font-medium whitespace-pre-line">
              {recordDetail.content ?? ''}
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex-none p-8 border-t border-gray-100 flex flex-col gap-3 bg-white">
        <button
          type="button"
          onClick={onOpenFullDetail}
          className="w-full py-5 rounded-[24px] bg-[#FE8916] hover:bg-[#E67800] text-white font-black shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          기록 전체보기 <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
