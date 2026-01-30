import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DeleteTagModal } from '../modals/DeleteTagModal';
import { BackArrowIcon } from '@/shared/ui/icons/BackArrowIcon';
import { PlusIconMobile } from '@/shared/ui/icons/PlusIconMobile';
import { XMarkIcon } from '@/shared/ui/icons/XMarkIcon';
import type { TagsTabProps } from '@features/settings/types';

interface TagsTabMobileProps extends TagsTabProps {
  onBack: () => void;
}

/**
 * 모바일 태그 관리 탭
 */
export function TagsTabMobile({
  onBack,
  tags,
  onAddTag,
  onRemoveTag,
}: TagsTabMobileProps) {
  const [inputValue, setInputValue] = useState('');
  const [tagToDelete, setTagToDelete] = useState<(typeof tags)[number] | null>(
    null,
  );

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.some((t) => t.name === trimmed)) return;
    onAddTag(trimmed);
    setInputValue('');
  };

  const handleDeleteConfirm = () => {
    if (tagToDelete) {
      onRemoveTag(tagToDelete);
      setTagToDelete(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 z-10 bg-white flex flex-col"
      >
        <header className="flex h-[80px] items-center px-6 border-b border-[#f3f4f6] shrink-0">
          <button
            onClick={onBack}
            className="flex size-11 items-center justify-center rounded-2xl bg-[#f8fafc] transition-colors hover:bg-[#f1f3f5] active:scale-95"
          >
            <BackArrowIcon className="size-6 text-[#364153]" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-bold text-[#1a1c1e]">
            태그 관리
          </h1>
        </header>

        <main className="flex flex-col flex-1 overflow-y-auto">
          {/* Create Tag Form */}
          <section className="p-7 border-b border-[#f3f4f6]">
            <h2 className="mb-3 font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[13px] font-medium text-[#4a5565]">
              새 태그 만들기
            </h2>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center rounded-2xl bg-[#f3f4f6] px-5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  type="text"
                  placeholder="예: 가족 여행, 업무, 독서"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    if (e.nativeEvent.isComposing) return;
                    handleAddTag();
                  }}
                  className="h-[56px] w-full bg-transparent font-['Inter:Regular',sans-serif] text-[16px] text-[#364153] outline-none placeholder:text-[#99a1af]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="flex size-[56px] items-center justify-center rounded-2xl bg-[#f3f4f6] text-[#99a1af] hover:bg-[#e5e7eb] active:scale-95 transition-all"
              >
                <PlusIconMobile className="size-6" />
              </button>
            </div>
          </section>

          {/* Tag List */}
          <section className="p-7">
            <h2 className="mb-2 font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-[#364153]">
              등록된 태그
            </h2>
            <p className="mb-8 font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] leading-relaxed text-[#99a1af]">
              태그를 삭제하면 해당 태그가 포함된 모든 기록에서 태그 정보가 함께
              삭제됩니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {tags.map((tag) => (
                  <motion.div
                    key={tag.publicId}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 rounded-full bg-[#f3f4f6] py-2.5 pl-4 pr-3 transition-colors hover:bg-gray-200"
                  >
                    <span className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[14px] font-medium text-[#4a5565]">
                      {tag.name}
                    </span>
                    <button
                      onClick={() => setTagToDelete(tag)}
                      className="group flex size-5 items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                    >
                      <XMarkIcon className="size-2.5 text-[#99a1af] group-hover:text-[#FB2C36]" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </main>
      </motion.div>

      <DeleteTagModal
        isOpen={!!tagToDelete}
        onCancel={() => setTagToDelete(null)}
        onConfirm={handleDeleteConfirm}
        tagName={tagToDelete?.name ?? ''}
      />
    </>
  );
}
