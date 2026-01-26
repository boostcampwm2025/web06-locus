import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';
import type { ConnectedRecordCardProps } from '../types/connectionManagement';

/**
 * 연결된 기록 태그
 */
function ConnectedRecordTags({ tags }: { tags: string[] }) {
  const { displayTags } = getDisplayTags(tags, 2);

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

/**
 * 연결 해제 버튼
 */
function ConnectedRecordRemoveButton({
  onRemove,
  recordId,
}: {
  onRemove?: (recordId: string) => void;
  recordId: string;
}) {
  if (!onRemove) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove(recordId);
      }}
      className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
      aria-label="연결 해제"
    >
      <XIcon className="w-5 h-5 text-gray-400" />
    </button>
  );
}

/**
 * 연결된 기록 카드 컴포넌트
 */
export default function ConnectedRecordCard({
  record,
  onRemove,
  onClick,
  className = '',
}: ConnectedRecordCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // X 버튼 클릭 시에는 카드 클릭 이벤트가 발생하지 않도록
    if ((e.target as HTMLElement).closest('button[aria-label="연결 해제"]')) {
      return;
    }
    onClick?.(record.id);
  };

  return (
    <div
      onClick={onClick ? handleCardClick : undefined}
      className={`flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
      } ${className}`}
    >
      <ConnectedRecordImage imageUrl={record.imageUrl} title={record.title} />
      <div className="flex-1 min-w-0">
        <ConnectedRecordTitle title={record.title} />
        <ConnectedRecordLocationDate
          location={record.location}
          date={record.date}
        />
        <ConnectedRecordTags tags={record.tags} />
      </div>
      <ConnectedRecordRemoveButton onRemove={onRemove} recordId={record.id} />
    </div>
  );
}

/**
 * 연결된 기록 이미지
 */
function ConnectedRecordImage({
  imageUrl,
  title,
}: {
  imageUrl?: string;
  title: string;
}) {
  if (imageUrl) {
    return (
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={`${title} 기록 이미지`}
          className="w-full h-full object-cover"
          aria-label={`${title} 기록의 이미지`}
        />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 w-20 h-20 rounded-lg bg-gray-200"
      role="img"
      aria-label={`${title} 기록 이미지 없음`}
    />
  );
}

/**
 * 연결된 기록 제목
 */
function ConnectedRecordTitle({ title }: { title: string }) {
  return (
    <h3 className="text-base font-medium text-gray-900 line-clamp-1 mb-2">
      {title}
    </h3>
  );
}

/**
 * 연결된 기록 위치 및 날짜
 */
function ConnectedRecordLocationDate({
  location,
  date,
}: {
  location: { name: string };
  date: Date;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
      <LocationIcon className="w-4 h-4 shrink-0" />
      <span className="truncate">{location.name}</span>
      <span>{formatDateShort(date)}</span>
    </div>
  );
}
