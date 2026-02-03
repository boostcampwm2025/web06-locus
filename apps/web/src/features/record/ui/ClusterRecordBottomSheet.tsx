import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { ChevronDownIcon } from '@/shared/ui/icons/ChevronDownIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import { BookmarkIcon } from '@/shared/ui/icons/BookmarkIcon';
import { ClockIcon } from '@/shared/ui/icons/ClockIcon';
import type { ClusterRecordBottomSheetProps } from '../types';
import type { Record as RecordItem } from '../types/record';

function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '날짜 정보 없음';
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

function extractTitle(text: string, maxLength = 50): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] ?? '';
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + '…';
}

export default function ClusterRecordBottomSheet({
  isOpen,
  onClose,
  topRecord,
  clusterRecords,
  onRecordClick,
}: ClusterRecordBottomSheetProps) {
  const [isListExpanded, setIsListExpanded] = useState(false);

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="summary">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Main Info Section */}
        <div className="shrink-0 px-8 pt-2 pb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-tighter">
                  TOP RECORD
                </span>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(topRecord.createdAt)}</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-[1.2] tracking-tight break-keep">
                {extractTitle(topRecord.text, 50)}
              </h2>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-90"
                aria-label="닫기"
              >
                <XIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2.5 bg-gray-50 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-90"
                aria-label="북마크"
              >
                <BookmarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Premium Location Card */}
          {topRecord.location?.name ? (
            <div className="mb-6 group">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                  <LocationIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[16px] text-gray-900 mb-0.5 truncate tracking-tight">
                    {topRecord.location.name}
                  </p>
                  {topRecord.location.address ? (
                    <p className="text-[13px] text-gray-500 truncate font-medium">
                      {topRecord.location.address}
                    </p>
                  ) : null}
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          ) : null}

          {/* Smart Tags */}
          {topRecord.tags && topRecord.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topRecord.tags.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-[12px] font-bold bg-white text-gray-600 border border-gray-100 shadow-sm hover:border-blue-100 hover:text-blue-600 transition-all cursor-default"
                >
                  <TagIcon className="w-3 h-3 text-gray-400" />#{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Body & List Section — 하단 탭(홈/기록)에 가려지지 않도록 하단 여백 확보 */}
        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar min-h-0 pb-[72px]">
          <div className="py-4 mb-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-100/50 rounded-full" />
              <p className="text-[16px] text-gray-700 whitespace-pre-line leading-[1.8] font-medium pl-2 tracking-tight">
                {topRecord.text}
              </p>
            </div>
          </div>

          {/* Cluster Records Section */}
          {clusterRecords.length > 1 ? (
            <div className="pb-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsListExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between py-4 px-5 bg-gray-50 rounded-2xl group transition-all hover:bg-gray-100/80 active:scale-[0.98]"
                aria-expanded={isListExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {clusterRecords.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[15px] font-extrabold text-gray-800">
                    묶음 기록{' '}
                    <span className="text-blue-600 ml-1">
                      {clusterRecords.length}개
                    </span>
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isListExpanded ? 180 : 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isListExpanded ? (
                  <motion.ul
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 overflow-hidden"
                    role="list"
                  >
                    {clusterRecords.map((record: RecordItem, index: number) => (
                      <motion.li
                        key={record.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onRecordClick?.(record.id);
                          }}
                          className="w-full text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-gray-900 truncate tracking-tight">
                              {extractTitle(record.text, 35)}
                            </p>
                            <p className="text-[11px] text-gray-400 font-bold mt-0.5 tracking-wider">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </div>
    </BaseBottomSheet>
  );
}
