import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { EditIcon } from '@/shared/ui/icons/EditIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import ActionButton from '@/shared/ui/button/ActionButton';
import type {
  RecordSummaryBottomSheetProps,
  RecordSummaryHeaderProps,
  RecordLocationCardProps,
  RecordTagsSectionProps,
} from '../types';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function extractTitle(text: string, maxLength = 20): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] ?? '';

  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + '…';
}

export default function RecordSummaryBottomSheet({
  isOpen,
  onClose,
  record,
  onEdit,
  onDelete,
}: RecordSummaryBottomSheetProps) {
  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
      <div className="flex flex-col h-full">
        {/* 고정 영역: 헤더, 위치, 태그, 버튼 */}
        <div className="shrink-0 px-6 pt-6">
          <RecordSummaryHeader
            title={extractTitle(record.text)}
            date={record.createdAt}
            onClose={onClose}
          />
          <RecordLocationCard location={record.location} />
          <RecordTagsSection tags={record.tags} />
        </div>

        {/* 스크롤 영역: 설명 텍스트 */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="pb-6">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {record.text}
            </p>
          </div>
        </div>

        {/* 고정 영역: 액션 버튼 */}
        <div className="shrink-0 px-6 pb-6 pt-4 border-t border-transparent">
          <div className="flex gap-3">
            {onEdit && (
              <ActionButton
                variant="secondary"
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                수정
              </ActionButton>
            )}
            {onDelete && (
              <ActionButton
                variant="secondary"
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500"
              >
                <TrashIcon className="w-4 h-4" />
                삭제
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </BaseBottomSheet>
  );
}

function RecordSummaryHeader({
  title,
  date,
  onClose,
}: RecordSummaryHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <h2 className="text-lg font-normal text-gray-900 mb-2">{title}</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDate(date)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="닫기"
      >
        <XIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

function RecordLocationCard({ location }: RecordLocationCardProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <LocationIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">{location.name}</p>
          <p className="text-sm text-gray-600">{location.address}</p>
        </div>
      </div>
    </div>
  );
}

function RecordTagsSection({ tags }: RecordTagsSectionProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TagIcon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">태그</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
