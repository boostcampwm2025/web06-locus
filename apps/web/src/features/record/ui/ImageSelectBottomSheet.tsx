import BaseBottomSheet from '@/shared/ui/bottomSheet/BaseBottomSheet';
import { CameraIcon } from '@/shared/ui/icons/CameraIcon';
import { ImageIcon } from '@/shared/ui/icons/ImageIcon';
import { ActionButton, OptionButton } from '@/shared/ui/button';
import type { ImageSelectBottomSheetProps } from '../types';

export default function ImageSelectBottomSheet({
  isOpen,
  onClose,
  onTakePhoto,
  onSelectFromLibrary,
}: ImageSelectBottomSheetProps) {
  const handleTakePhoto = () => {
    onTakePhoto();
    onClose();
  };

  const handleSelectFromLibrary = () => {
    onSelectFromLibrary();
    onClose();
  };

  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="image">
      <div className="px-6 py-6 pb-12">
        <OptionButton
          icon={<CameraIcon className="w-6 h-6 text-gray-700" />}
          title="사진 촬영"
          description="지금 순간을 바로 기록하기"
          onClick={handleTakePhoto}
        />

        <OptionButton
          icon={<ImageIcon className="w-6 h-6 text-gray-700" />}
          title="라이브러리에서 선택"
          description="저장된 사진 불러오기"
          onClick={handleSelectFromLibrary}
        />

        {/* 취소 버튼 */}
        <ActionButton
          variant="secondary"
          onClick={onClose}
          className="mt-4 mb-4"
        >
          취소
        </ActionButton>
      </div>
    </BaseBottomSheet>
  );
}
