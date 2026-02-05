import { useState } from 'react';
import { motion } from 'motion/react';
import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { ImageIcon } from '@/shared/ui/icons/ImageIcon';
import { ImageWithFallback } from '@/shared/ui/image';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { useGetRecordDetail } from '../hooks/useGetRecordDetail';
import { useDeleteRecord } from '../hooks/useDeleteRecord';
import { useToast } from '@/shared/ui/toast';
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
import type { Coordinates } from '../types';

export default function RecordSummaryBottomSheet({
  isOpen,
  onClose,
  record,
  onAddRecord,
  recordCoordinates,
  onShowLinkedRecords,
  hasConnectedRecords = false,
}: RecordSummaryBottomSheetProps) {
  const publicId = typeof record === 'string' ? record : record.id;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deleteRecordMutation = useDeleteRecord();
  const { showToast } = useToast();

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

  // 좌표 추출 (Record 객체: recordCoordinates 우선, API: recordDetail.location)
  const coords: Coordinates | undefined =
    typeof record !== 'string'
      ? (recordCoordinates ??
        (record as { coordinates?: Coordinates }).coordinates)
      : recordDetail
        ? {
            lat: recordDetail.location.latitude,
            lng: recordDetail.location.longitude,
          }
        : undefined;

  // 데이터 가공 (직접 전달받은 경우 vs API에서 가져온 경우)
  const displayData =
    typeof record !== 'string'
      ? {
          title: extractTitle(record.text),
          date: record.createdAt,
          location: {
            ...record.location,
            coordinates: coords,
          },
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
              coordinates: coords,
            },
            tags: recordDetail.tags?.map((tag) => tag.name) ?? [],
            content: recordDetail.content ?? '',
            images: getImageUrls(recordDetail),
          }
        : {
            title: '',
            date: new Date(),
            location: { name: '', address: '', coordinates: undefined },
            tags: [],
            content: '',
            images: undefined,
          };

  const handleDeleteConfirm = () => {
    deleteRecordMutation.mutate(publicId, {
      onSuccess: () => {
        onClose();
        showToast({ variant: 'success', message: '기록이 삭제되었습니다.' });
      },
      onError: () => {
        showToast({ variant: 'error', message: '삭제에 실패했습니다.' });
      },
    });
  };

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
      <RecordSummaryContent
        {...displayData}
        onClose={onClose}
        onAddRecord={onAddRecord}
        onShowLinkedRecords={onShowLinkedRecords}
        hasConnectedRecords={hasConnectedRecords}
        onDeleteClick={() => setIsDeleteConfirmOpen(true)}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="이 기록을 삭제할까요?"
        message="삭제한 기록은 다시 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
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
  onClose,
  onAddRecord,
  onShowLinkedRecords,
  hasConnectedRecords = false,
  onDeleteClick,
}: RecordSummaryContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 1. 고정 헤더 영역 */}
      <div className="shrink-0 px-6 pt-6">
        <RecordSummaryHeader
          title={title}
          date={date}
          onClose={onClose}
          onDeleteClick={
            typeof onDeleteClick === 'function' ? onDeleteClick : undefined
          }
        />
        <RecordLocationCard
          location={location}
          onAddRecord={onAddRecord}
          hasConnectedRecords={hasConnectedRecords}
          onShowLinkedRecords={onShowLinkedRecords}
          onClose={onClose}
        />
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
    </div>
  );
}

function RecordSummaryHeader({
  title,
  date,
  onClose,
  onDeleteClick,
}: RecordSummaryHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex-1 pr-2 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h2 className="text-[1.125rem] font-semibold text-gray-900 break-all flex-1 min-w-0">
            {title}
          </h2>
          {typeof onDeleteClick === 'function' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors shrink-0"
              aria-label="삭제"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
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

function RecordLocationCard({
  location,
  onAddRecord,
  hasConnectedRecords = false,
  onShowLinkedRecords,
  onClose,
}: RecordLocationCardProps) {
  const hasLocation = Boolean(
    location.name?.trim() || location.address?.trim(),
  );
  const primary =
    location.name?.trim() || location.address?.trim() || '알 수 없는 장소';
  const secondary =
    hasLocation && location.name?.trim() && location.address?.trim()
      ? location.address
      : null;
  const coords = location.coordinates;
  const canAddRecord =
    Boolean(onAddRecord) &&
    coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng);

  const handleAddRecord = () => {
    if (onAddRecord && coords) {
      onAddRecord({
        name: location.name ?? '',
        address: location.address ?? '',
        coordinates: { lat: coords.lat, lng: coords.lng },
      });
    }
  };

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
        {canAddRecord && (
          <button
            type="button"
            onClick={handleAddRecord}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-transparent hover:border-blue-200 active:scale-90 transition-all"
            title="이 장소에 추가"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {hasConnectedRecords && (
        <button
          type="button"
          onClick={() => {
            if (onShowLinkedRecords) {
              onShowLinkedRecords();
            } else {
              onClose?.();
            }
          }}
          className="w-full mt-3 py-2 bg-white/60 hover:bg-white rounded-xl flex items-center justify-center gap-2 text-blue-600 text-[0.8125rem] font-bold border border-blue-100/50 transition-all active:scale-[0.98]"
        >
          <span>🔗</span>
          <span>이 장소와 연결된 기록 확인</span>
        </button>
      )}
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
