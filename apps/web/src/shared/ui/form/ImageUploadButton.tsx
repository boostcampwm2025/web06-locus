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
          maxFiles={maxFiles}
          currentCount={selectedImages.length}
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

/** 모바일 "이미지 추가" 트리거. 바텀시트용 버튼 또는 파일 input 연동 label. 최대 개수·현재 개수 표시로 데스크톱과 동일한 UX 제공. */
function ImageUploadMobileTrigger({
  isDisabled,
  isCompressing,
  maxFiles = 5,
  currentCount = 0,
  onMobileAddClick,
  onFilesSelected,
}: {
  isDisabled: boolean;
  isCompressing: boolean;
  maxFiles?: number;
  currentCount?: number;
  onMobileAddClick?: () => void;
  onFilesSelected?: (files: File[]) => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const atLimit = currentCount >= maxFiles;
  const disabled = isDisabled || atLimit;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      void onFilesSelected?.(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getButtonLabel = () => {
    if (isCompressing) return '처리 중...';
    if (atLimit) return '최대 개수에 도달했어요';
    return `이미지 추가 (${currentCount}/${maxFiles})`;
  };

  const getSubMessage = () => {
    if (isCompressing) return '잠시만 기다려주세요';
    if (atLimit) return `최대 ${maxFiles}개까지만 등록할 수 있습니다.`;
    return `최대 ${maxFiles}개 가능`;
  };

  const triggerContent = (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-3">
        <ImageIcon
          className={`w-6 h-6 ${atLimit ? 'text-gray-300' : 'text-gray-400'}`}
        />
        <span
          className={`text-sm font-medium ${
            atLimit ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {getButtonLabel()}
        </span>
      </span>
      <span className="text-xs text-gray-400">{getSubMessage()}</span>
    </span>
  );

  const baseClass =
    'w-full px-4 py-4 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors';

  if (onMobileAddClick) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={onMobileAddClick}
          disabled={disabled}
          className={`${baseClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
        >
          {triggerContent}
        </button>
      </div>
    );
  }

  return (
    <>
      <label
        htmlFor={inputId}
        className={`${baseClass} cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
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
        disabled={disabled}
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
