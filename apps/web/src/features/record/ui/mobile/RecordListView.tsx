import { AnimatePresence, motion } from 'motion/react';
import { BackArrowIcon } from '@/shared/ui/icons/BackArrowIcon';
import { FavoriteIcon } from '@/shared/ui/icons/FavoriteIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { ClockIcon } from '@/shared/ui/icons/ClockIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { RecordCard } from './RecordCard';
import type {
  RecordListViewProps,
  RecordListMainRecord,
  RecordListItem,
} from '@/features/record/types';

/**
 * 슬라이드업 시 나오는 전체 기록 리스트 뷰(전체 화면).
 * MainMapPage.mobile에서 바텀시트를 위로 올렸을 때 노출.
 */
export function RecordListView({
  isVisible,
  currentMainRecord,
  currentTab,
  bukhansanRecords,
  connectionRecords,
  activeRecordIndex,
  activeConnectionIndex,
  onBack,
  onTabChange,
  onRecordSelect,
  onViewDetail,
}: RecordListViewProps) {
  const records =
    currentTab === 'records' ? bukhansanRecords : connectionRecords;
  const activeIndex =
    currentTab === 'records' ? activeRecordIndex : activeConnectionIndex;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 bg-white z-50 flex flex-col"
        >
          <div className="px-6 pt-12 pb-4 border-b border-slate-50">
            <RecordListViewHeader onBack={onBack} />
            <RecordListViewMainRecordSection record={currentMainRecord} />
            <RecordListViewTabs
              currentTab={currentTab}
              recordsCount={bukhansanRecords.length}
              connectionsCount={connectionRecords.length}
              onTabChange={onTabChange}
            />
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 pb-24">
            <RecordListViewContent
              currentTab={currentTab}
              recordsCount={bukhansanRecords.length}
              connectionsCount={connectionRecords.length}
              locationName={currentMainRecord.location}
            />
            <RecordListViewRecordList
              records={records}
              activeIndex={activeIndex}
              onRecordSelect={onRecordSelect}
              onViewDetail={onViewDetail}
            />
          </div>

          <RecordListViewBottomBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecordListViewHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex justify-between items-start mb-6">
      <button
        type="button"
        onClick={onBack}
        className="p-1 -ml-1 text-slate-600"
        aria-label="뒤로"
      >
        <BackArrowIcon className="size-6" />
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          className="p-2 bg-slate-50 rounded-full text-red-500"
          aria-label="좋아요"
        >
          <FavoriteIcon className="size-5" fill="currentColor" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-slate-50 rounded-full text-slate-400"
          aria-label="닫기"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

function RecordListViewMainRecordSection({
  record,
}: {
  record: RecordListMainRecord;
}) {
  return (
    <motion.div
      key={record.title}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{record.title}</h2>
      <p className="text-slate-400 text-sm mb-4">{record.location}</p>
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
        <ClockIcon className="size-3.5 shrink-0" />
        <span>{record.date}</span>
      </div>
      <div className="flex gap-2 mb-6">
        {record.tags.map((tag, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              idx === 0
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {idx === 0 ? '' : '#'}
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function RecordListViewTabs({
  currentTab,
  recordsCount,
  connectionsCount,
  onTabChange,
}: {
  currentTab: 'records' | 'connections';
  recordsCount: number;
  connectionsCount: number;
  onTabChange: (tab: 'records' | 'connections') => void;
}) {
  return (
    <div className="flex border-b border-slate-100 -mx-6 px-6">
      <button
        type="button"
        onClick={() => onTabChange('records')}
        className={`flex-1 py-3 text-sm relative transition-colors ${
          currentTab === 'records'
            ? 'text-blue-600 font-bold'
            : 'text-slate-400 font-medium'
        }`}
      >
        기록 ({recordsCount})
        {currentTab === 'records' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => onTabChange('connections')}
        className={`flex-1 py-3 text-sm relative transition-colors ${
          currentTab === 'connections'
            ? 'text-blue-600 font-bold'
            : 'text-slate-400 font-medium'
        }`}
      >
        연결 ({connectionsCount})
        {currentTab === 'connections' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
          />
        )}
      </button>
    </div>
  );
}

function RecordListViewContent({
  currentTab,
  recordsCount,
  connectionsCount,
  locationName,
}: {
  currentTab: 'records' | 'connections';
  recordsCount: number;
  connectionsCount: number;
  locationName: string;
}) {
  const label =
    currentTab === 'records'
      ? `${recordsCount}개의 내 기록`
      : `${connectionsCount}개의 연결된 기록`;

  return (
    <>
      <div className="text-sm font-medium text-slate-400 mb-4">{label}</div>
      <div className="mb-6 bg-blue-50/40 border border-dashed border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center py-6 group cursor-pointer hover:bg-blue-50 transition-colors">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform">
          <PlusIcon className="size-6 stroke-3" />
        </div>
        <p className="text-blue-700 font-bold text-sm">
          이 장소에 새 기록 남기기
        </p>
        <p className="text-blue-400 text-[11px] mt-1">
          &quot;{locationName}&quot; 정보가 자동으로 포함됩니다
        </p>
      </div>
    </>
  );
}

function RecordListViewRecordList({
  records,
  activeIndex,
  onRecordSelect,
  onViewDetail,
}: {
  records: RecordListItem[];
  activeIndex: number;
  onRecordSelect: (index: number) => void;
  onViewDetail: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {records.map((rec, i) => (
        <div
          key={i}
          onClick={() => onRecordSelect(i)}
          role="button"
          tabIndex={0}
        >
          <RecordCard
            {...rec}
            isSelected={activeIndex === i}
            onViewDetail={onViewDetail}
          />
        </div>
      ))}
    </div>
  );
}

function RecordListViewBottomBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-8">
      <button
        type="button"
        className="w-full bg-blue-600 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-[0.98]"
      >
        <PlusIcon className="size-5 stroke-3" />
        지금 이 장소에 기록 남기기
      </button>
    </div>
  );
}
