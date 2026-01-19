import { useState } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/shared/icons/Icons';
import ActionButton from '@/shared/ui/button/ActionButton';
import CategoryChip from '@/shared/ui/category/CategoryChip';
import {
  TextAreaField,
  ImageUploadButton,
  FormSection,
  FormInputField,
} from '@/shared/ui/form';
import ImageSelectBottomSheet from './ImageSelectBottomSheet';
import RecordSummaryBottomSheet from './RecordSummaryBottomSheet';
import { useRecordForm } from './hook/useRecordForm';
import { useRecordMap } from './hook/useRecordMap';
import { useCreateRecord } from '../hooks/useCreateRecord';
import DraggablePinOverlay from '@/infra/map/marker/DraggablePinOverlay';
import type {
  RecordWritePageProps,
  Record,
  RecordWriteHeaderProps,
  RecordWriteFormProps,
  RecordWriteMapProps,
  Coordinates,
} from '../types';

export default function RecordWritePage({
  initialLocation,
  initialCoordinates,
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
    handleTitleChange,
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

  // 핀 위치를 state로 관리 (드래그로 조정 가능)
  const [currentCoordinates, setCurrentCoordinates] = useState<
    Coordinates | undefined
  >(initialCoordinates);

  const createRecordMutation = useCreateRecord();

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

  const handleSave = async () => {
    if (!canSave) {
      // TODO: 에러 처리 (텍스트 필수)
      return;
    }

    if (!currentCoordinates) {
      // TODO: 좌표가 없으면 에러 처리
      console.error('좌표 정보가 없습니다.');
      return;
    }

    try {
      // API 호출
      const response = await createRecordMutation.mutateAsync({
        request: {
          title: formData.title.trim(),
          content: formData.text.trim(),
          location: {
            latitude: currentCoordinates.lat,
            longitude: currentCoordinates.lng,
          },
          tags: formData.tags,
        },
        images: [], // TODO: 이미지 기능 구현 후 추가
      });

      // API 응답을 Record 타입으로 변환
      const record: Record = {
        id: response.publicId,
        text: response.title,
        tags: response.tags,
        location: {
          name: response.location.name ?? initialLocation.name,
          address: response.location.address ?? initialLocation.address,
        },
        createdAt: new Date(response.createdAt),
      };

      // 홈으로 라우팅하면서 record와 coordinates 전달
      // MainMapPage에서 토스트와 핀 표시 처리
      onSave(record, currentCoordinates);
    } catch (error) {
      console.error('기록 생성 실패:', error);
      // TODO: 에러 토스트 표시
    }
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
      <RecordWriteMap
        initialCoordinates={initialCoordinates}
        currentCoordinates={currentCoordinates}
        onCoordinatesChange={setCurrentCoordinates}
      />
      <RecordWriteForm
        formData={formData}
        availableTags={availableTags}
        isAddingTag={isAddingTag}
        newTagInput={newTagInput}
        onTitleChange={handleTitleChange}
        onTextChange={handleTextChange}
        onTagToggle={handleTagToggle}
        onAddTagClick={startAddTag}
        onTagInputChange={(e) => {
          setNewTagInput(e.target.value);
        }}
        onConfirmAddTag={confirmAddTag}
        onCancelAddTag={cancelAddTag}
        onAddImage={handleAddImage}
        onSave={() => void handleSave()}
        onCancel={onCancel}
        canSave={canSave}
        isSaving={createRecordMutation.isPending}
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

function RecordWriteMap({
  initialCoordinates,
  currentCoordinates,
  onCoordinatesChange,
}: RecordWriteMapProps) {
  const {
    mapContainerRef,
    mapInstanceRef,
    isMapLoaded,
    mapLoadError,
    handleZoomIn,
    handleZoomOut,
  } = useRecordMap({
    initialCoordinates: currentCoordinates ?? initialCoordinates,
    zoom: 16,
    zoomControl: false,
  });

  // 핀 위치 (드래그 가능)
  const pinCoordinates = currentCoordinates ?? initialCoordinates;

  // 핀 드래그 핸들러
  const handlePinDrag = (newPosition: Coordinates) => {
    if (onCoordinatesChange) {
      onCoordinatesChange(newPosition);
    }
    // 지도 중심도 함께 이동
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(
        new naver.maps.LatLng(newPosition.lat, newPosition.lng),
      );
    }
  };

  return (
    <div className="relative flex-[0.4] bg-gray-100">
      {/* 지도 컨테이너 - 항상 렌더링 (ref를 위해 필요) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 로딩/에러 오버레이 */}
      {mapLoadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-red-500 text-sm">{mapLoadError}</p>
        </div>
      ) : !isMapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-gray-400 text-sm">지도를 불러오는 중...</p>
        </div>
      ) : null}

      {/* 커스텀 오버레이 핀 마커 (드래그 가능) */}
      {isMapLoaded && mapInstanceRef.current && pinCoordinates && (
        <DraggablePinOverlay
          map={mapInstanceRef.current}
          pin={{
            id: 'record-location',
            position: pinCoordinates,
            variant: 'current',
          }}
          isSelected={false}
          onDragEnd={handlePinDrag}
        />
      )}

      {/* 지도 컨트롤 (확대/축소) */}
      {isMapLoaded && (
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="확대"
          >
            <ZoomInIcon className="w-5 h-5 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="축소"
          >
            <ZoomOutIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}

function RecordWriteForm({
  formData,
  availableTags,
  isAddingTag,
  newTagInput,
  onTitleChange,
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
  isSaving = false,
}: RecordWriteFormProps) {
  return (
    <div className="flex-[0.6] bg-white rounded-t-3xl shadow-lg overflow-y-auto">
      <div className="px-6 py-6 space-y-6">
        {/* 제목 섹션 */}
        <FormInputField
          label="제목"
          type="text"
          value={formData.title}
          onChange={onTitleChange}
          placeholder="기록의 제목을 입력하세요"
          required
        />

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
          <ActionButton
            variant="primary"
            onClick={onSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? '저장 중...' : '기록 작성하기'}
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
