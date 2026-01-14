import { LocationIcon } from '@/shared/icons';
import type { RecordConnectionCardProps } from '../types/recordConnection';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';

export default function RecordConnectionCard({
  record,
  onClick,
  className = '',
}: RecordConnectionCardProps) {
  const { displayTags, remainingCount: remainingTagCount } = getDisplayTags(
    record.tags,
    2,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors text-left w-full ${className}`}
    >
      {/* 이미지 영역 */}
      {record.imageUrl && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
          <img
            src={record.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* 제목 및 관련 태그 */}
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-900 line-clamp-1 flex-1">
            {record.title}
          </h3>
          {record.isRelated && (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full shrink-0">
              관련
            </span>
          )}
        </div>

        {/* 위치 & 날짜 */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <LocationIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{record.location.name}</span>
          <span className="mx-1">·</span>
          <span>{formatDateShort(record.date)}</span>
        </div>

        {/* 태그 */}
        {displayTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {displayTags.map((tag) => (
              <span
                key={tag}
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
    </button>
  );
}
