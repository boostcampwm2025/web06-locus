import { AnimatePresence, motion } from 'motion/react';
import { LinkIcon } from '@/shared/ui/icons/LinkIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { ImageWithFallback } from '@/shared/ui/image';
import type { ConnectionConfirmDialogProps } from '@/features/record/types/record';

/**
 * 연결 확인 다이얼로그 컴포넌트
 * DesktopUI 디자인을 참고한 이미지 중심의 시각적 다이얼로그
 */
export default function ConnectionConfirmDialog({
  isOpen,
  onClose,
  departure,
  arrival,
  onConfirm,
  isConnecting = false,
}: ConnectionConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-110 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-[48px] w-full max-w-xl overflow-hidden shadow-[0_40px_80px_-12px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-12 text-center">
              {/* 아이콘 */}
              <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full text-[#FE8916] shadow-inner">
                <LinkIcon className="w-9 h-9" />
              </div>

              {/* 제목 */}
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                기록 연결하기
              </h2>
              <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
                두 기록 사이의 새로운 연결 고리를
                <br />
                생성하시겠습니까?
              </p>

              {/* 기록 카드들 */}
              <div className="flex items-center justify-between gap-6 mb-12 relative px-4">
                {/* 연결선 */}
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[2px] overflow-hidden">
                  <div className="w-full h-full border-t-2 border-dashed border-orange-200" />
                  <motion.div
                    animate={{ x: [0, 100], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute top-0 left-0 w-8 h-full bg-linear-to-r from-transparent via-[#FE8916] to-transparent"
                  />
                </div>

                {/* 출발 기록 */}
                <ConnectionNode
                  title={departure.title}
                  imageUrl={departure.imageUrl}
                  label="Source"
                  isTarget={false}
                />

                {/* 연결 아이콘 */}
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-[#FE8916] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(254,137,22,0.4)] shrink-0 group">
                  <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </div>

                {/* 도착 기록 */}
                <ConnectionNode
                  title={arrival.title}
                  imageUrl={arrival.imageUrl}
                  label="Target"
                  isTarget={true}
                />
              </div>

              {/* 버튼 */}
              <div className="grid grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isConnecting}
                  className="py-5 rounded-3xl bg-gray-50 text-gray-500 font-black hover:bg-gray-100 transition-all active:scale-95 text-lg disabled:opacity-50"
                >
                  취소하기
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isConnecting}
                  className="py-5 rounded-3xl bg-[#FE8916] text-white font-black hover:bg-[#E67800] transition-all active:scale-95 shadow-[0_12px_28px_rgba(254,137,22,0.35)] text-lg disabled:opacity-50"
                >
                  {isConnecting ? '연결 중...' : '연결 확정'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConnectionNode({
  title,
  imageUrl,
  label,
  isTarget = false,
}: {
  title: string;
  imageUrl?: string;
  label: string;
  isTarget?: boolean;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center w-1/3">
      <div className="w-28 h-28 rounded-[32px] overflow-hidden shadow-xl mb-4 border-4 border-white ring-1 ring-gray-100">
        <ImageWithFallback
          src={imageUrl ?? 'https://placehold.co/400x400'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${
          isTarget ? 'bg-orange-50 text-[#FE8916]' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {label}
      </span>
      <p className="text-sm font-bold text-gray-900 truncate w-full text-center">
        {title}
      </p>
    </div>
  );
}
