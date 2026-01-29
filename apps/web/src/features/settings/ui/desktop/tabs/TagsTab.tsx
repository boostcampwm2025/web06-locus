import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TagIcon } from '@/shared/ui/icons/TagIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import type { TagsTabProps } from '../../../types';

export function TagsTab({ tags, onAddTag, onRemoveTag }: TagsTabProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.some((t) => t.name === trimmed)) return;
    onAddTag(trimmed);
    setNewTag('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <header>
        <h1 className="text-4xl font-black text-gray-900 mb-4">태그 관리</h1>
        <p className="text-gray-500 text-lg">
          기록을 더 효율적으로 분류할 수 있도록 나만의 태그를 구성하세요.
        </p>
      </header>

      <div className="space-y-8">
        <div className="relative">
          <input
            type="text"
            placeholder="새로운 태그를 입력하고 엔터를 누르세요"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (e.nativeEvent.isComposing) return;
              handleAddTag();
            }}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-[24px] p-6 text-lg font-bold placeholder:text-gray-300 outline-none transition-all pr-32"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all"
          >
            추가하기
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-2">
            보유 중인 태그 ({tags.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {tags.map((tag) => (
                <motion.div
                  layout
                  key={tag.publicId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="group flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 rounded-[20px] hover:border-orange-400 hover:shadow-lg hover:shadow-orange-50 transition-all cursor-default"
                >
                  <span className="font-black text-gray-700"># {tag.name}</span>
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-[14px] h-[14px]" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-orange-50 border border-orange-100 flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#FE8916] shrink-0 shadow-sm">
            <TagIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-orange-900 mb-1">태그 활용 팁</h4>
            <p className="text-sm text-orange-700 leading-relaxed opacity-80">
              의미 있는 태그를 설정하면 나중에 기록을 검색하거나 테마별로 모아볼
              때 훨씬 편리합니다. 여행지, 분위기, 혹은 함께한 사람 위주로 태그를
              만들어보세요!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
