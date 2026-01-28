import { motion } from 'motion/react';
import { LinkIcon } from '@/shared/ui/icons/LinkIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import type { RecordConnectionHeaderProps } from '@/features/record/types/record';

/**
 * 연결 모드 헤더 컴포넌트
 * 상단에 고정되어 기준 기록과 연결할 기록 선택 안내를 표시합니다.
 */
export default function ConnectionHeader({
  fromRecord,
  onCancel,
}: RecordConnectionHeaderProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-60 flex items-center gap-6 px-8 py-5 bg-white shadow-2xl rounded-[32px] border border-gray-100 min-w-[600px]"
    >
      {/* 기준 기록 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FE8916] flex items-center justify-center text-white shadow-lg shadow-orange-100">
          <LinkIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            기준 기록
          </p>
          <p className="font-black text-gray-900">{fromRecord?.title}</p>
        </div>
      </div>

      {/* 연결선 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="h-px bg-gray-100 flex-1 relative">
          <div className="absolute inset-0 bg-orange-500/20 animate-pulse" />
        </div>
        <div className="px-4 text-[#FE8916] animate-bounce">
          <ChevronRightIcon className="w-5 h-5" />
        </div>
        <div className="h-px bg-gray-100 flex-1" />
      </div>

      {/* 연결할 기록 선택 안내 */}
      <div className="flex items-center gap-4 text-gray-400 italic">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <PlusIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold">연결할 기록을 선택하세요</p>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onCancel}
        className="ml-4 p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
        aria-label="취소"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
