import { LinkIcon, LocationIcon, ArrowRightIcon } from '@/shared/icons/Icons';
import type { RecordCardProps } from './RecordCard.types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';

export default function RecordCard({
  title,
  location,
  date,
  tags,
  connectionCount,
  imageUrl,
  onClick,
  className = '',
}: RecordCardProps) {
  // TODO: +N 버튼 클릭 핸들러 추가하여 모든 태그 표시 토글
  const { displayTags, remainingCount: remainingTagCount } = getDisplayTags(
    tags,
    2,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors text-left w-full ${className}`}
    >
      {/* 이미지 영역 - 이미지가 있을 때만 렌더링 */}
      {imageUrl && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* 제목 */}
        <h3 className="text-base font-medium text-gray-900 line-clamp-1">
          {title}
        </h3>

        {/* 위치 & 날짜 */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <LocationIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{location.name}</span>
          <span>{formatDateShort(date)}</span>
        </div>

        {/* 태그 & 연결 개수 */}
        <div className="flex items-center justify-between gap-2">
          {displayTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
          <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>연결 {connectionCount}</span>
          </div>
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <ArrowRightIcon className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
    </button>
  );
}
