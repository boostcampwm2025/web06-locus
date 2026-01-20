import { LocationIcon } from '@/shared/icons';
import type {
  RecommendedRecordsSectionProps,
  RecordConnectionItem,
} from '../types/recordConnection';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';

/**
 * 추천 기록 섹션 컴포넌트
 */
export default function RecommendedRecordsSection({
  title = '추천 기록',
  description = '동일한 태그 또는 인접한 장소',
  records,
  onRecordClick,
  emptyMessage = '기록이 없습니다',
  className = '',
  scrollHeight,
}: RecommendedRecordsSectionProps) {
  return (
    <section className={`flex flex-col ${className}`}>
      <header className="px-4 py-3 shrink-0">
        <h2 className="text-md font-normal text-gray-500 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </header>

      {/* children 래퍼에 스크롤 적용 */}
      <div
        className={`${scrollHeight ?? ''} ${scrollHeight ? 'overflow-y-auto' : ''}`}
      >
        <RecordConnectionList
          records={records}
          onRecordClick={onRecordClick}
          emptyMessage={emptyMessage}
        />
      </div>
    </section>
  );
}

/**
 * 기록 연결 카드 컴포넌트 (내부 사용)
 */
function RecordConnectionCard({
  record,
  onClick,
  className = '',
}: {
  record: RecordConnectionItem;
  onClick?: () => void;
  className?: string;
}) {
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

/**
 * 기록 연결 리스트 컴포넌트 (내부 사용)
 */
function RecordConnectionList({
  records,
  onRecordClick,
  emptyMessage = '기록이 없습니다',
}: {
  records: RecordConnectionItem[];
  onRecordClick?: (record: RecordConnectionItem) => void;
  emptyMessage?: string;
}) {
  if (records.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-500 border-t border-transparent">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-0 border-t border-transparent">
      {records.map((record) => (
        <RecordConnectionCard
          key={record.id}
          record={record}
          onClick={() => onRecordClick?.(record)}
        />
      ))}
    </div>
  );
}
