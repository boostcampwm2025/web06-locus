import { useState } from 'react';
import ArrowLeftIcon from '@/shared/icons/ArrowLeftIcon';
import PlusIcon from '@/shared/icons/PlusIcon';
import XIcon from '@/shared/icons/XIcon';
import ZoomInIcon from '@/shared/icons/ZoomInIcon';
import ZoomOutIcon from '@/shared/icons/ZoomOutIcon';
import ActionButton from '@/shared/ui/button/ActionButton';
import CategoryChip from '@/shared/ui/category/CategoryChip';
import {
  TextAreaField,
  ImageUploadButton,
  FormSection,
} from '@/shared/ui/form';
import ImageSelectBottomSheet from './ImageSelectBottomSheet';
import RecordSummaryBottomSheet from './RecordSummaryBottomSheet';
import { useRecordForm } from './hook/useRecordForm';
import type {
  RecordWritePageProps,
  Record,
  RecordWriteHeaderProps,
  RecordWriteFormProps,
} from '../types';
import { createMockRecord } from '../domain/record.mock';

export default function RecordWritePage({
  initialLocation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialCoordinates: _initialCoordinates, // TODO: 지도 SDK 연동 시 사용
  onSave,
  onCancel,
  onTakePhoto,
  onSelectFromLibrary,
}: RecordWritePageProps) {
  // 기본 태그 목록 (mock)
  const availableTags = ['식사', '카페', '운동', '업무'];

  const {
    formData,
    isAddingTag,
    newTagInput,
    setNewTagInput,
    handleTextChange,
    handleTagToggle,
    startAddTag,
    cancelAddTag,
    confirmAddTag,
    canSave,
  } = useRecordForm(availableTags);

  const [isImageSelectSheetOpen, setIsImageSelectSheetOpen] = useState(false);
  const [savedRecord, setSavedRecord] = useState<Record | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleAddImage = () => {
    setIsImageSelectSheetOpen(true);
  };

  const handleTakePhoto = () => {
    // TODO: 사진 촬영 기능 구현
    onTakePhoto?.();
  };

  const handleSelectFromLibrary = () => {
    // TODO: 라이브러리에서 선택 기능 구현
    onSelectFromLibrary?.();
  };

  const handleSave = () => {
    if (!canSave) {
      // TODO: 에러 처리 (텍스트 필수)
      return;
    }

    const record = createMockRecord(formData, initialLocation);
    setSavedRecord(record);
    setIsDetailSheetOpen(true);
    onSave(record);
  };

  const handleDetailSheetClose = () => {
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

  const handleEdit = () => {
    // TODO: 수정 기능 구현
    setIsDetailSheetOpen(false);
  };

  const handleDelete = () => {
    // TODO: 삭제 기능 구현
    setIsDetailSheetOpen(false);
    setSavedRecord(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <RecordWriteHeader location={initialLocation} onCancel={onCancel} />
      <RecordWriteMap />
      <RecordWriteForm
        formData={formData}
        availableTags={availableTags}
        isAddingTag={isAddingTag}
        newTagInput={newTagInput}
        onTextChange={handleTextChange}
        onTagToggle={handleTagToggle}
        onAddTagClick={startAddTag}
        onTagInputChange={(e) => {
          setNewTagInput(e.target.value);
        }}
        onConfirmAddTag={confirmAddTag}
        onCancelAddTag={cancelAddTag}
        onAddImage={handleAddImage}
        onSave={handleSave}
        onCancel={onCancel}
        canSave={canSave}
      />

      {/* 이미지 선택 바텀시트 */}
      <ImageSelectBottomSheet
        isOpen={isImageSelectSheetOpen}
        onClose={() => {
          setIsImageSelectSheetOpen(false);
        }}
        onTakePhoto={handleTakePhoto}
        onSelectFromLibrary={handleSelectFromLibrary}
      />

      {/* 기록 요약 바텀시트 */}
      {savedRecord && (
        <RecordSummaryBottomSheet
          isOpen={isDetailSheetOpen}
          onClose={handleDetailSheetClose}
          record={savedRecord}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function RecordWriteHeader({ location, onCancel }: RecordWriteHeaderProps) {
  return (
    <header className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="뒤로가기"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
      </button>
      <div className="flex-1 ml-2">
        <h1 className="text-base font-medium text-gray-900">{location.name}</h1>
        <p className="text-xs text-gray-500">{location.address}</p>
      </div>
    </header>
  );
}

function RecordWriteMap() {
  return (
    <div className="relative flex-[0.4] bg-gray-100">
      {/* TODO: 지도 SDK 연동 */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-green-50 to-yellow-50">
        {/* 지도 배경 시뮬레이션 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-green-200 rounded-full blur-3xl" />
        </div>
      </div>

      {/* TODO: 지도 SDK 마커 표시 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
      </div>

      {/* 지도 컨트롤 (확대/축소) */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <button
          type="button"
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="확대"
        >
          <ZoomInIcon className="w-5 h-5 text-gray-700" />
        </button>
        <button
          type="button"
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="축소"
        >
          <ZoomOutIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

function RecordWriteForm({
  formData,
  availableTags,
  isAddingTag,
  newTagInput,
  onTextChange,
  onTagToggle,
  onAddTagClick,
  onTagInputChange,
  onConfirmAddTag,
  onCancelAddTag,
  onAddImage,
  onSave,
  onCancel,
  canSave,
}: RecordWriteFormProps) {
  return (
    <div className="flex-[0.6] bg-white rounded-t-3xl shadow-lg overflow-y-auto">
      <div className="px-6 py-6 space-y-6">
        {/* 메모 섹션 */}
        <TextAreaField
          label="메모"
          value={formData.text}
          onChange={onTextChange}
          placeholder="이곳에서의 기억을 기록해보세요."
          required
        />

        {/* 이미지 섹션 */}
        <ImageUploadButton label="이미지" onClick={onAddImage} />

        {/* 태그 섹션 */}
        <FormSection title="태그">
          <div className="flex items-center gap-2 flex-wrap">
            {availableTags.map((tag) => (
              <CategoryChip
                key={tag}
                label={tag}
                isSelected={formData.tags.includes(tag)}
                onClick={() => {
                  onTagToggle(tag);
                }}
              />
            ))}
            {/* 사용자가 추가한 태그만 표시 (availableTags에 없는 것) */}
            {formData.tags
              .filter((tag) => !availableTags.includes(tag))
              .map((tag) => (
                <CategoryChip
                  key={tag}
                  label={tag}
                  isSelected={true}
                  onClick={() => {
                    // 커스텀 태그는 클릭해도 아무 동작 안 함
                  }}
                />
              ))}
            {isAddingTag ? (
              <>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={onTagInputChange}
                  placeholder="태그 입력"
                  className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onConfirmAddTag();
                    } else if (e.key === 'Escape') {
                      onCancelAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={onConfirmAddTag}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={onCancelAddTag}
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  aria-label="취소"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onAddTagClick}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="태그 추가"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </FormSection>

        {/* 액션 버튼 */}
        <div className="pt-4 space-y-2.5">
          <ActionButton variant="primary" onClick={onSave} disabled={!canSave}>
            저장하기
          </ActionButton>
          <ActionButton variant="secondary" onClick={onCancel}>
            취소
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
