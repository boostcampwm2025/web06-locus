import { useEffect } from 'react';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { PlusIcon } from '@/shared/ui/icons/PlusIcon';
import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { useRecordForm } from '../hook/useRecordForm';
import { useCreateRecord } from '../../hooks/useCreateRecord';
import { useGetTags } from '../../hooks/useGetTags';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useToast } from '@/shared/ui/toast';
import type { RecordWritePageProps, Record } from '../../types';

export function RecordWritePageDesktop({
  initialLocation,
  initialCoordinates,
  onSave,
  onCancel,
}: RecordWritePageProps) {
  const {
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
    isCreatingTag,
    canSave,
  } = useRecordForm();

  const createRecordMutation = useCreateRecord();
  const { data: allTags = [] } = useGetTags();
  const { showToast } = useToast();

  // 이미지 업로드 훅
  const {
    selectedImages,
    previewUrls,
    isCompressing,
    handleFilesSelected,
    handleRemoveFile,
    cleanup,
  } = useImageUpload({
    maxFiles: 5,
    enableCompression: true,
    compressionOptions: {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      initialQuality: 0.8,
      alwaysKeepResolution: false,
    },
    onFilesSelected: (files) => {
      showToast({
        variant: 'success',
        message: `${files.length}개의 이미지가 선택되었습니다.`,
      });
    },
    onValidationError: (error) => {
      showToast({
        variant: 'error',
        message: error.message,
      });
    },
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleSave = async () => {
    if (!canSave) {
      showToast({
        variant: 'error',
        message: '제목과 내용을 입력해주세요.',
      });
      return;
    }

    if (!initialCoordinates) {
      showToast({
        variant: 'error',
        message: '위치 정보가 없습니다.',
      });
      return;
    }

    try {
      const tagPublicIds = formData.tags
        .map((tagName) => {
          const tag = allTags.find((t) => t.name === tagName);
          return tag?.publicId;
        })
        .filter((publicId): publicId is string => !!publicId);

      const response = await createRecordMutation.mutateAsync({
        request: {
          title: formData.title.trim(),
          content: formData.text.trim(),
          location: {
            latitude: initialCoordinates.lat,
            longitude: initialCoordinates.lng,
          },
          tags: tagPublicIds,
        },
        images: selectedImages,
      });

      const record: Record = {
        id: response.publicId,
        text: response.title,
        tags: (response.tags ?? []).map((tag) => tag.name),
        location: {
          name: response.location.name ?? initialLocation.name,
          address: response.location.address ?? initialLocation.address,
        },
        createdAt: new Date(response.createdAt),
      };

      onSave(record, initialCoordinates);
    } catch (error) {
      console.error('기록 생성 실패:', error);
      showToast({
        variant: 'error',
        message: '기록 저장에 실패했습니다.',
      });
    }
  };

  const removeTag = (target: string) => {
    handleTagToggle(target);
  };

  return (
    <div className="fixed top-0 right-0 w-[480px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-60 border-l border-gray-100 flex flex-col">
      {/* 헤더 */}
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            새로운 기록 남기기
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            지금 이 순간의 기억을 지도로 저장하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
        {/* 1. 위치 정보 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              1. 위치 정보
            </h3>
          </div>
          <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-[#FE8916]">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-gray-900 leading-tight">
                {initialLocation.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {initialLocation.address}
              </p>
            </div>
          </div>
        </section>

        {/* 2. 기록 내용 */}
        <section>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            2. 기록 내용
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full text-xl font-bold border-none bg-transparent placeholder:text-gray-300 focus:ring-0 p-0"
            />
            <textarea
              placeholder="오늘의 경험은 어땠나요?"
              value={formData.text}
              onChange={handleTextChange}
              className="w-full min-h-[180px] text-gray-700 bg-gray-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400 resize-none leading-relaxed"
            />
          </div>
        </section>

        {/* 3. 사진 추가 */}
        <section>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            3. 사진 추가
          </h3>
          {previewUrls && previewUrls.length > 0 ? (
            <div className="space-y-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group rounded-[32px] overflow-hidden aspect-video border border-gray-100"
                >
                  <img
                    src={url}
                    alt={`이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = async (e) => {
                  const files = Array.from(
                    (e.target as HTMLInputElement).files ?? [],
                  );
                  if (files.length > 0) {
                    await handleFilesSelected(files);
                  }
                };
                input.click();
              }}
              className="w-full aspect-video rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-4 hover:border-orange-400 hover:bg-orange-50/30 transition-all"
            >
              <PlusIcon className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">
                클릭하거나 사진을 드래그하세요
              </p>
            </button>
          )}
          {isCompressing && (
            <p className="text-sm text-gray-500 mt-2">이미지 압축 중...</p>
          )}
        </section>

        {/* 4. 태그 설정 */}
        <section>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            4. 태그 설정
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FE8916] text-white text-xs font-bold shadow-md shadow-orange-100"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer"
                >
                  <XIcon className="w-[14px] h-[14px]" />
                </button>
              </span>
            ))}
          </div>
          {isAddingTag ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="태그 입력 후 엔터"
                className="flex-1 bg-gray-50 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none border border-gray-100"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCreatingTag}
                maxLength={5}
                autoFocus
              />
              <button
                type="button"
                onClick={() => void confirmAddTag()}
                disabled={isCreatingTag}
                className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isCreatingTag ? '생성 중...' : '추가'}
              </button>
              <button
                type="button"
                onClick={cancelAddTag}
                className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = formData.tags.includes(tag.name);
                return (
                  <button
                    key={tag.publicId}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={startAddTag}
                className="px-5 py-2.5 rounded-full text-xs font-black bg-white text-gray-400 border border-gray-100 hover:border-gray-300 transition-all"
              >
                + 새 태그
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 하단 버튼 */}
      <div className="p-8 border-t border-gray-100 bg-white grid grid-cols-5 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="col-span-2 py-4 rounded-2xl bg-gray-50 text-gray-500 font-black"
        >
          취소하기
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave || createRecordMutation.isPending}
          className="col-span-3 py-4 rounded-2xl bg-[#FE8916] text-white font-black hover:bg-[#E67800] shadow-xl shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createRecordMutation.isPending ? '저장 중...' : '기록 저장하기'}
        </button>
      </div>
    </div>
  );
}
