import { useState } from 'react';
import type { RecordFormData } from '../../types';
import { useCreateTag } from '../../hooks/useCreateTag';
import { useGetTags } from '../../hooks/useGetTags';
import { sentry } from '@/shared/utils/sentryWrapper';

export function useRecordForm(
  onCreateTag?: (tagName: string) => Promise<void>,
) {
  const [formData, setFormData] = useState<RecordFormData>({
    title: '',
    text: '',
    tags: [],
  });
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isConfirmingTag, setIsConfirmingTag] = useState(false);
  const createTagMutation = useCreateTag();
  const { data: allTags = [] } = useGetTags();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

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

  /**
   * 키보드 이벤트 핸들러 (Enter 입력 시 태그 추가)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 1. 한글 입력 중 엔터 시 중복 실행 방지
      if (e.nativeEvent.isComposing) return;

      e.preventDefault();
      void confirmAddTag();
    } else if (e.key === 'Escape') {
      cancelAddTag();
    }
  };

  const confirmAddTag = async () => {
    // 중복 클릭/입력 방지
    if (isConfirmingTag || createTagMutation.isPending) return;

    const trimmedTag = newTagInput.trim();

    if (!trimmedTag) {
      cancelAddTag();
      return;
    }

    // 글자수 제한
    if (trimmedTag.length > 5) {
      // TODO: Toast('5자 이내로 입력해주세요');
      return;
    }

    // 2. 현재 선택된 태그와 대소문자 무시하고 중복 체크
    if (
      formData.tags.some((t) => t.toLowerCase() === trimmedTag.toLowerCase())
    ) {
      cancelAddTag();
      return;
    }

    setIsConfirmingTag(true);

    try {
      // 3. 서버 태그 목록(캐시)에서 대소문자 무시하고 찾기
      // allTags는 React Query 캐시이므로, useCreateTag에서 invalidateQueries를 호출하면 자동 업데이트됨
      const existingTag = allTags.find(
        (tag) => tag.name.toLowerCase() === trimmedTag.toLowerCase(),
      );

      if (existingTag) {
        // 이미 존재하는 태그면 서버 생성 없이 바로 추가
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, existingTag.name], // 서버에 저장된 원래 케이스 사용
        }));
      } else {
        // 신규 태그 생성
        const newTag = await createTagMutation.mutateAsync({
          name: trimmedTag,
        });
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag.name],
        }));
      }

      if (onCreateTag) await onCreateTag(trimmedTag);
      cancelAddTag();
    } catch (error) {
      console.error('태그 처리 실패:', error);
      // 4. 에러 발생 시에도 UI는 초기화하여 다음 입력을 준비
      cancelAddTag();

      // Sentry 에러 리포팅
      if (error instanceof Error) {
        void sentry.captureException(error, {
          tags: {
            component: 'useRecordForm',
            action: 'confirmAddTag',
          },
          extra: {
            tagName: trimmedTag,
          },
        });
      } else {
        void sentry.captureException(new Error('태그 처리 실패'), {
          tags: {
            component: 'useRecordForm',
            action: 'confirmAddTag',
          },
          extra: {
            tagName: trimmedTag,
            error: String(error),
          },
        });
      }
    } finally {
      setIsConfirmingTag(false);
    }
  };

  return {
    formData,
    isAddingTag,
    newTagInput,
    setNewTagInput,
    handleTitleChange,
    handleTextChange,
    handleTagToggle,
    startAddTag,
    cancelAddTag,
    confirmAddTag,
    handleKeyDown,
    isCreatingTag: createTagMutation.isPending,
    canSave:
      typeof formData.title === 'string' &&
      typeof formData.text === 'string' &&
      !!formData.title.trim() &&
      !!formData.text.trim(),
  };
}
