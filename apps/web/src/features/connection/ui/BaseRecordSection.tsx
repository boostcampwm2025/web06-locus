import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { Link2Icon } from '@/shared/ui/icons/Link2Icon';
import { formatDateShort } from '@/shared/utils/dateUtils';
import type { BaseRecordSectionProps } from '../types/connectionManagement';

/**
 * 기준 기록 섹션 컴포넌트
 */
export default function BaseRecordSection({
  record,
  className = '',
}: BaseRecordSectionProps) {
  return (
    <section className={`bg-gray-800 text-white w-full ${className}`}>
      <div className="px-4 py-5">
        <BaseRecordTitle title={record.title} />
        <BaseRecordLocationDate location={record.location} date={record.date} />
        <BaseRecordTags tags={record.tags} />
        <BaseRecordFooter connectionCount={record.connectionCount} />
      </div>
    </section>
  );
}

/**
 * 기준 기록 제목
 */
function BaseRecordTitle({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>;
}

/**
 * 기준 기록 위치 및 날짜
 */
function BaseRecordLocationDate({
  location,
  date,
}: {
  location: { name: string; address: string };
  date: Date;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white mb-3">
      <LocationIcon className="w-4 h-4 shrink-0 text-white" />
      <span>
        {location.name?.trim() || location.address?.trim() || '장소 없음'}
      </span>
      <span>{formatDateShort(date)}</span>
    </div>
  );
}

/**
 * 기준 기록 태그 목록
 */
function BaseRecordTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-1 bg-white/20 text-white text-xs font-medium rounded-full"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

/**
 * 기준 기록 하단 정보 (레이블 및 연결 개수)
 */
function BaseRecordFooter({ connectionCount }: { connectionCount: number }) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/30">
      <span className="text-sm text-white">기준 기록</span>
      <div className="flex items-center gap-1.5 text-sm text-white">
        <Link2Icon className="w-4 h-4 text-white" />
        <span>연결 {connectionCount}</span>
      </div>
    </div>
  );
}
