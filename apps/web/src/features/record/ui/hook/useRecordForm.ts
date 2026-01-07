import { useState } from 'react';
import type { RecordFormData } from '../../types';

export function useRecordForm(availableTags: string[]) {
  const [formData, setFormData] = useState<RecordFormData>({
    text: '',
    tags: [],
  });
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const startAddTag = () => {
    setIsAddingTag(true);
  };

  const cancelAddTag = () => {
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const confirmAddTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag) {
      // 중복 체크 (기존 태그 목록과 사용자가 추가한 태그 모두 확인)
      const allTags = [...availableTags, ...formData.tags];
      if (!allTags.includes(trimmedTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, trimmedTag],
        }));
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  return {
    formData,
    isAddingTag,
    newTagInput,
    setNewTagInput,
    handleTextChange,
    handleTagToggle,
    startAddTag,
    cancelAddTag,
    confirmAddTag,
    canSave: !!formData.text.trim(),
  };
}
