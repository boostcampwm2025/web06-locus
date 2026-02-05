import { AnimatePresence, motion } from 'motion/react';
import { ClockIcon } from '@/shared/ui/icons/ClockIcon';
import { FavoriteIcon } from '@/shared/ui/icons/FavoriteIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { MoreVerticalIcon } from '@/shared/ui/icons/MoreVerticalIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import type { SummaryBottomSheetProps } from '@/features/record/types';

/**
 * 연결 요약 바텀시트(플로팅 카드형). 모달이 아닌 바텀시트.
 * MainMapPage.mobile에서 상세 보기 활성화 시 해당 핀의 최신 기록 요약 노출용.
 */
export function SummaryBottomSheet({
  isVisible,
  data,
  onExpand,
  onClose,
}: SummaryBottomSheetProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-40"
        >
          <div
            onClick={onExpand}
            className="bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <SummaryBottomSheetHandle />
            <div className="px-6 pb-6 pt-2">
              <SummaryBottomSheetHeader
                title={data.title}
                time={data.time}
                onClose={onClose}
              />
              <SummaryBottomSheetTags tags={data.tags} />
              <SummaryBottomSheetFooter connectedCount={data.connectedCount} />
            </div>
          </div>
          <SummaryBottomSheetHint />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryBottomSheetHandle() {
  return (
    <div className="w-full flex justify-center pt-3 pb-1">
      <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
    </div>
  );
}

function SummaryBottomSheetHeader({
  title,
  time,
  onClose,
}: {
  title: string;
  time: string;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <ClockIcon className="size-[14px] shrink-0" />
          <span>{time}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          aria-label="좋아요"
        >
          <FavoriteIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 bg-slate-50 rounded-full text-slate-400"
          aria-label="닫기"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

function SummaryBottomSheetTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex gap-2 mb-6">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-0.5 ${
            i === 0 ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-500'
          }`}
        >
          {i === 0 && <TagIcon className="size-2.5 shrink-0" />}
          {tag}
        </span>
      ))}
    </div>
  );
}

function SummaryBottomSheetFooter({
  connectedCount,
}: {
  connectedCount: number;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2 text-slate-700 font-medium group">
        <span className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
          <MoreVerticalIcon className="size-4 text-slate-500" />
        </span>
        <span className="text-sm">
          연결된 기록{' '}
          <strong className="text-blue-600">{connectedCount}개</strong>
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all active:scale-95"
      >
        <PlusIcon className="size-4 stroke-3" />
        <span className="text-xs font-bold">기록 추가하기</span>
      </button>
    </div>
  );
}

function SummaryBottomSheetHint() {
  return (
    <div className="flex justify-center mt-3">
      <span className="text-slate-400 text-[10px] font-medium animate-bounce flex flex-col items-center">
        위로 올려서 전체 보기
        <ChevronRightIcon className="-rotate-90 size-3 mt-0.5" />
      </span>
    </div>
  );
}
