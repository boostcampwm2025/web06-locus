import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import { FileTextIcon } from '@/shared/ui/icons/FileTextIcon';
import type { RecordListCardProps } from '@/features/record/types';

/**
 * 슬라이드업 리스트 내 기록 카드.
 * RecordListView에서 각 기록 항목으로 사용.
 */
export function RecordCard({
  title,
  description,
  date,
  location,
  tags,
  connections,
  isSelected,
  onViewDetail,
}: RecordListCardProps) {
  const borderClass = isSelected
    ? 'border-blue-500 shadow-md'
    : 'border-slate-100 shadow-sm';

  return (
    <div
      className={`p-4 bg-white rounded-2xl border transition-all ${borderClass} mb-3`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
        {connections != null && (
          <span className="text-[10px] text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full bg-slate-50">
            연결 {connections}
          </span>
        )}
      </div>
      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
        <span>{date}</span>
        <span className="flex items-center gap-0.5">
          <MapPinIcon className="size-2.5 shrink-0" /> {location}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]"
            >
              #{tag}
            </span>
          ))}
        </div>
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <FileTextIcon className="size-3" />
            상세 보기
          </button>
        )}
      </div>
    </div>
  );
}
