import { useState } from 'react';
import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { ChevronDownIcon } from '@/shared/ui/icons/ChevronDownIcon';
import type { ClusterRecordBottomSheetProps } from '../types';

function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '날짜 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

function extractTitle(text: string, maxLength = 8): string {
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
      <div className="flex flex-col h-full">
        {/* 대표 기록 요약 */}
        <div className="shrink-0 px-6 pt-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 pr-2">
              <h2 className="text-[1.125rem] font-semibold text-gray-900 mb-1.5 break-all">
                {extractTitle(topRecord.text)}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formatDate(topRecord.createdAt)}</span>
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

          {topRecord.location?.name ? (
            <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
                  <LocationIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">
                    {topRecord.location.name}
                  </p>
                  {topRecord.location.address ? (
                    <p className="text-[0.8125rem] text-gray-500 truncate">
                      {topRecord.location.address}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {topRecord.tags && topRecord.tags.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TagIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[0.8125rem] font-semibold text-gray-700">
                  태그
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {topRecord.tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-2.5 py-1 rounded-lg text-[0.8125rem] font-medium bg-gray-100 text-gray-600 border border-gray-200/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 스크롤 영역: 본문 + 전체 기록 목록 */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0 custom-scrollbar">
          <div className="pb-4">
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {topRecord.text}
            </p>
          </div>

          {/* 이 그리드의 전체 기록 (슬라이드업 시 확장) */}
          {clusterRecords.length > 1 && (
            <div className="pb-8 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsListExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                aria-expanded={isListExpanded}
              >
                <span>이 그리드의 전체 기록 ({clusterRecords.length}개)</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform ${isListExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isListExpanded && (
                <ul className="mt-2 space-y-1" role="list">
                  {clusterRecords.map((record) => (
                    <li key={record.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onRecordClick?.(record.id);
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl hover:bg-gray-50 border border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {extractTitle(record.text, 30)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(record.createdAt)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseBottomSheet>
  );
}
