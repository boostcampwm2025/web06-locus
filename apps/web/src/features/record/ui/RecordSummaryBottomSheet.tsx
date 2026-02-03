import { motion } from 'motion/react';
import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { EditIcon } from '@/shared/ui/icons/EditIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { ImageIcon } from '@/shared/ui/icons/ImageIcon';
import ActionButton from '@/shared/ui/button/ActionButton';
import { ImageWithFallback } from '@/shared/ui/image';
import { useGetRecordDetail } from '../hooks/useGetRecordDetail';
import { logger } from '@/shared/utils/logger';
import LoadingPage from '@/shared/ui/loading/LoadingPage';
import type { RecordDetail } from '@locus/shared';
import type {
  RecordSummaryBottomSheetProps,
  RecordSummaryHeaderProps,
  RecordLocationCardProps,
  RecordTagsSectionProps,
  RecordSummaryContentProps,
} from '../types';
import { extractTagNames } from '@/shared/utils/tagUtils';

export default function RecordSummaryBottomSheet({
  isOpen,
  onClose,
  record,
  isDeleting = false,
  onEdit,
  onDelete,
}: RecordSummaryBottomSheetProps) {
  const publicId = typeof record === 'string' ? record : record.id;

  // 1. 상세 정보 조회 Hook (ID로 넘어왔을 때만 활성화)
  const {
    data: recordDetailRaw,
    isLoading,
    isError,
  } = useGetRecordDetail(publicId, {
    enabled: isOpen && typeof record === 'string',
  });

  // 타입 단언 (useQuery의 타입 추론 문제 해결)
  const recordDetail: RecordDetail | undefined = recordDetailRaw ?? undefined;

  // 로딩 상태 처리
  if (isOpen && typeof record === 'string' && isLoading) {
    return (
      <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
        <div className="flex items-center justify-center h-full">
          <LoadingPage version={1} />
        </div>
      </BaseBottomSheet>
    );
  }

  // 에러 상태 처리
  if (isOpen && typeof record === 'string' && (isError || !recordDetail)) {
    logger.error(new Error('기록 상세 조회 실패'), {
      publicId,
      component: 'RecordSummaryBottomSheet',
    });
    return (
      <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm">기록을 불러올 수 없습니다.</p>
        </div>
      </BaseBottomSheet>
    );
  }

  // 이미지 URL 목록 추출 (API 응답: medium → thumbnail → original)
  const getImageUrls = (detail: RecordDetail): string[] => {
    const list = detail.images ?? [];
    return list
      .map(
        (img: {
          medium?: { url?: string };
          thumbnail?: { url?: string };
          original?: { url?: string };
        }) => img.medium?.url ?? img.thumbnail?.url ?? img.original?.url,
      )
      .filter((url): url is string => Boolean(url));
  };

  // 데이터 가공 (직접 전달받은 경우 vs API에서 가져온 경우)
  const displayData =
    typeof record !== 'string'
      ? {
          title: extractTitle(record.text),
          date: record.createdAt,
          location: record.location,
          tags: Array.isArray(record.tags) ? extractTagNames(record.tags) : [],
          content: record.text,
          images: record.images,
        }
      : recordDetail
        ? {
            title: extractTitle(recordDetail.title),
            date: recordDetail.createdAt,
            location: {
              name: recordDetail.location.name ?? '',
              address: recordDetail.location.address ?? '',
            },
            tags: recordDetail.tags?.map((tag) => tag.name) ?? [],
            content: recordDetail.content ?? '',
            images: getImageUrls(recordDetail),
          }
        : {
            title: '',
            date: new Date(),
            location: { name: '', address: '' },
            tags: [],
            content: '',
            images: undefined,
          };

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
      <RecordSummaryContent
        {...displayData}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
      />
    </BaseBottomSheet>
  );
}

/**
 * 날짜 포맷팅 함수
 */
function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '날짜 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 제목 추출 함수
 */
function extractTitle(text: string, maxLength = 20): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] ?? '';
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + '…';
}

function RecordSummaryContent({
  title,
  date,
  location,
  tags,
  content,
  images,
  isDeleting,
  onEdit,
  onDelete,
  onClose,
}: RecordSummaryContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 1. 고정 헤더 영역 */}
      <div className="shrink-0 px-6 pt-6">
        <RecordSummaryHeader title={title} date={date} onClose={onClose} />
        <RecordLocationCard location={location} />
      </div>

      {/* 2. 스크롤 영역 (이미지 갤러리 + 태그 + 본문) */}
      <div className="flex-1 overflow-y-auto px-6 min-h-0 custom-scrollbar">
        {/* 본문 이미지 갤러리 (ClusterRecordBottomSheet와 동일 스타일) */}
        {(() => {
          const imageList = images ?? [];
          if (imageList.length === 0) return null;
          return (
            <div className="relative mb-8 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photos ({imageList.length})</span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-2 px-2">
                {imageList.map((img, idx) => (
                  <motion.div
                    key={`${img}-${idx}`}
                    whileTap={{ scale: 0.98 }}
                    className="relative shrink-0 w-64 h-48 rounded-4xl overflow-hidden shadow-md snap-center border-4 border-white"
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })()}
        <RecordTagsSection tags={tags} />
        <div className="pb-8">
          <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {content}
          </p>
        </div>
      </div>

      {/* 3. 고정 액션 버튼 영역 */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-gray-50">
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
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordSummaryHeader({
  title,
  date,
  onClose,
}: RecordSummaryHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex-1 pr-2">
        <h2 className="text-[1.125rem] font-semibold text-gray-900 mb-1.5 break-all">
          {title}
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{formatDate(date)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
        aria-label="닫기"
      >
        <XIcon className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}

function RecordLocationCard({ location }: RecordLocationCardProps) {
  const primary =
    location.name?.trim() || location.address?.trim() || '장소 없음';
  const secondary =
    location.name?.trim() && location.address?.trim() ? location.address : null;
  if (!location.name?.trim() && !location.address?.trim()) return null;
  return (
    <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
          <LocationIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">
            {primary}
          </p>
          {secondary && (
            <p className="text-[0.8125rem] text-gray-500 truncate">
              {secondary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordTagsSection({ tags }: RecordTagsSectionProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <TagIcon className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[0.8125rem] font-semibold text-gray-700">
          태그
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="px-2.5 py-1 rounded-lg text-[0.8125rem] font-medium bg-gray-100 text-gray-600 border border-gray-200/50"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
