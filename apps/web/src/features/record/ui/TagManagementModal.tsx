import { useState } from 'react';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { useGetTags } from '../hooks/useGetTags';
import { useDeleteTag } from '../hooks/useDeleteTag';
import type { TagResponse } from '@/infra/api/services/tagService';
import ToastErrorMessage from '@/shared/ui/alert/ToastErrorMessage';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagManagementModal({
  isOpen,
  onClose,
}: TagManagementModalProps) {
  const { data: tags = [], isLoading } = useGetTags();
  const deleteTagMutation = useDeleteTag();
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);
  const [showDeleteSuccessToast, setShowDeleteSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleDeleteTag = (tag: TagResponse) => {
    // 시스템 태그는 삭제 불가
    if (tag.isSystem) {
      return;
    }

    deleteTagMutation.mutate(tag.publicId, {
      onSuccess: () => {
        setShowDeleteSuccessToast(true);
        setTimeout(() => setShowDeleteSuccessToast(false), 3000);
      },
      onError: () => {
        setShowDeleteErrorToast(true);
        setTimeout(() => setShowDeleteErrorToast(false), 3000);
      },
    });
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">태그 관리</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* 태그 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              태그가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.publicId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-900">{tag.name}</span>
                    {tag.isSystem && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        시스템
                      </span>
                    )}
                  </div>
                  {!tag.isSystem && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      disabled={deleteTagMutation.isPending}
                      aria-label={`${tag.name} 태그 삭제`}
                      className="p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 알림 토스트 영역 */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {showDeleteSuccessToast && (
          <ToastErrorMessage
            message="태그가 삭제되었습니다"
            variant="success"
          />
        )}
        {showDeleteErrorToast && (
          <ToastErrorMessage
            message="태그 삭제에 실패했습니다."
            variant="error"
          />
        )}
      </div>
    </>
  );
}
