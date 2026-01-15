import {
  ArrowLeftIcon,
  FavoriteIcon,
  MoreVerticalIcon,
  CalendarIcon,
  LocationIcon,
} from '@/shared/icons';
import type { RecordDetailPageProps } from '@/features/record/types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';

export default function RecordDetailPage({
  title,
  date,
  location,
  tags,
  description,
  imageUrl,
  connectionCount,
  isFavorite = false,
  onBack,
  onFavoriteToggle,
  onMenuClick,
  onConnectionManage,
  onConnectionMode,
  className = '',
}: RecordDetailPageProps) {
  return (
    <div className={`flex flex-col min-h-screen h-full bg-white ${className}`}>
      <RecordDetailHeader
        title={title}
        isFavorite={isFavorite}
        onBack={onBack}
        onFavoriteToggle={onFavoriteToggle}
        onMenuClick={onMenuClick}
      />

      <RecordMetaInfo
        title={title}
        date={date}
        location={location}
        tags={tags}
      />

      <RecordContent
        imageUrl={imageUrl}
        description={description}
        title={title}
      />

      <RecordActionButtons
        connectionCount={connectionCount}
        onConnectionManage={onConnectionManage}
        onConnectionMode={onConnectionMode}
      />
    </div>
  );
}

/**
 * 헤더 컴포넌트
 */
function RecordDetailHeader({
  title,
  isFavorite,
  onBack,
  onFavoriteToggle,
  onMenuClick,
}: {
  title: string;
  isFavorite: boolean;
  onBack?: () => void;
  onFavoriteToggle?: () => void;
  onMenuClick?: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FavoriteIcon
            className={`w-6 h-6 ${
              isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'
            }`}
          />
        </button>
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="메뉴"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVerticalIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}

/**
 * 메타 정보 컴포넌트
 */
function RecordMetaInfo({
  title,
  date,
  location,
  tags,
}: {
  title: string;
  date: Date;
  location: { name: string; address: string };
  tags: string[];
}) {
  // 태그 표시 개수 제한 (모바일에서 1줄에 들어갈 수 있는 개수 기준)
  // TODO: +N 버튼 클릭 핸들러 추가하여 모든 태그 표시 토글
  const { displayTags, remainingCount: remainingTagCount } = getDisplayTags(
    tags,
    4,
  );

  return (
    <div className="px-4 pt-6 pb-4 border-b border-transparent">
      {' '}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      {/* 날짜 & 위치 */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDateShort(date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <LocationIcon className="w-4 h-4" />
          <span>{location.name}</span>
        </div>
      </div>
      {/* 태그 */}
      {displayTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {displayTags.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
          {remainingTagCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-full">
              +{remainingTagCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 콘텐츠 영역 컴포넌트
 */
function RecordContent({
  imageUrl,
  description,
  title,
}: {
  imageUrl?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* 이미지 (조건부 렌더링) */}
      {imageUrl && (
        <div className="w-full mb-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* 설명 텍스트 */}
      <div className="px-4 pb-6">
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * 하단 버튼 컴포넌트
 */
function RecordActionButtons({
  connectionCount,
  onConnectionManage,
  onConnectionMode,
}: {
  connectionCount: number;
  onConnectionManage?: () => void;
  onConnectionMode?: () => void;
}) {
  return (
    <div className="px-4 pt-4 pb-6 border-t border-gray-100 space-y-3">
      <button
        type="button"
        onClick={onConnectionManage}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-normal hover:bg-gray-800 transition-colors"
      >
        연결 관리 ({connectionCount})
      </button>
      <button
        type="button"
        onClick={onConnectionMode}
        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg font-normal hover:bg-gray-50 transition-colors"
      >
        연결 모드
      </button>
    </div>
  );
}
