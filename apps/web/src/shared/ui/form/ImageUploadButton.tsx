import { useId, useRef } from 'react';
import FormSection from './FormSection';
import { ImageIcon } from '@/shared/ui/icons/ImageIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import ImageDropzone from './ImageDropzone';
import { useViewportMobile } from '@/shared/hooks/useViewportMobile';
import type { ImageUploadButtonProps } from '@/shared/types/form';

/**
 * 이미지 업로드 컴포넌트
 * - 넓은 뷰포트(≥768px): 드래그앤드롭 영역
 * - 좁은 뷰포트(768px 미만): 버튼 클릭 → 파일 선택 다이얼로그 또는 바텀시트
 * 뷰포트 기반이라 리사이즈 시 UI가 전환됩니다.
 */
export default function ImageUploadButton({
  label,
  onFilesSelected,
  selectedImages = [],
  previewUrls = [],
  onRemoveImage,
  disabled = false,
  maxFiles = 5,
  isCompressing = false,
  className = '',
  onMobileAddClick,
}: ImageUploadButtonProps) {
  const { isDesktop: isDesktopViewport } = useViewportMobile();
  const isDisabled = disabled || isCompressing;

  return (
    <FormSection title={label} className={className}>
      {isDesktopViewport ? (
        <ImageDropzone
          onFilesSelected={onFilesSelected}
          disabled={isDisabled}
          maxFiles={maxFiles}
          currentCount={selectedImages.length}
          isCompressing={isCompressing}
        />
      ) : (
        <ImageUploadMobileTrigger
          isDisabled={isDisabled}
          isCompressing={isCompressing}
          onMobileAddClick={onMobileAddClick}
          onFilesSelected={onMobileAddClick ? undefined : onFilesSelected}
        />
      )}

      <ImageUploadPreviewList
        previewUrls={previewUrls}
        onRemoveImage={onRemoveImage}
        isDisabled={isDisabled}
      />
    </FormSection>
  );
}

/** 모바일 "이미지 추가" 트리거. 바텀시트용 버튼 또는 파일 input 연동 label */
function ImageUploadMobileTrigger({
  isDisabled,
  isCompressing,
  onMobileAddClick,
  onFilesSelected,
}: {
  isDisabled: boolean;
  isCompressing: boolean;
  onMobileAddClick?: () => void;
  onFilesSelected?: (files: File[]) => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      void onFilesSelected?.(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerContent = (
    <span className="contents">
      <ImageIcon className="w-6 h-6 text-gray-400" />
      <span className="text-gray-600 text-sm">
        {isCompressing ? '처리 중...' : '이미지 추가'}
      </span>
    </span>
  );

  const baseClass =
    'w-full px-4 py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors';

  if (onMobileAddClick) {
    return (
      <button
        type="button"
        onClick={onMobileAddClick}
        disabled={isDisabled}
        className={`${baseClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {triggerContent}
      </button>
    );
  }

  return (
    <>
      <label
        htmlFor={inputId}
        className={`${baseClass} cursor-pointer ${
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        {triggerContent}
      </label>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled}
      />
    </>
  );
}

/** 선택된 이미지 미리보기 + 삭제 */
function ImageUploadPreviewList({
  previewUrls,
  onRemoveImage,
  isDisabled,
}: {
  previewUrls: string[];
  onRemoveImage?: (index: number) => void;
  isDisabled: boolean;
}) {
  if (previewUrls.length === 0) return null;

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
      {previewUrls.map((previewUrl, index) => (
        <div key={previewUrl} className="relative shrink-0">
          <img
            src={previewUrl}
            alt={`선택된 이미지 ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg border border-gray-100"
          />
          {onRemoveImage && (
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              disabled={isDisabled}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="이미지 제거"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
