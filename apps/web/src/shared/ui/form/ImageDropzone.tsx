import { useCallback, useId } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon } from '@/shared/ui/icons/ImageIcon';
import type { ImageDropzoneProps } from '@/shared/types/form';

/**
 * 이미지 드래그앤드롭 영역 컴포넌트
 * 데스크톱 환경에서 사용합니다.
 * currentCount, isCompressing를 넘기면 상황별 안내 메시지를 표시합니다.
 */
export default function ImageDropzone({
  onFilesSelected,
  disabled = false,
  maxFiles = 5, // API 서버의 MAX_FILE_COUNT와 동일
  currentCount = 0,
  isCompressing = false,
  className = '',
}: ImageDropzoneProps) {
  const dropzoneInputId = useId();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        void onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.heif'],
    },
    multiple: true,
    maxFiles,
    disabled,
  });

  const getMainMessage = () => {
    if (isCompressing) return '이미지를 최적화하고 있어요...';
    if (disabled) return '이미 업로드 가능한 최대 개수에 도달했어요';
    if (isDragActive) return '여기에 이미지를 놓아주세요';
    return '이미지를 드래그하거나 클릭하여 선택하세요';
  };

  const getSubMessage = () => {
    if (isCompressing) return '잠시만 기다려주세요';
    if (disabled) return `최대 ${maxFiles}개까지만 등록할 수 있습니다.`;
    return `최대 ${maxFiles}개 가능 (현재 ${currentCount}/${maxFiles})`;
  };

  const mainMessage = getMainMessage();
  const isDragHighlight = isDragActive && !isCompressing && !disabled;

  return (
    <div
      {...getRootProps()}
      className={`
        w-full px-4 py-8 border-2 border-dashed rounded-xl
        flex flex-col items-center justify-center gap-3
        transition-colors cursor-pointer
        ${
          isDragHighlight
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <label htmlFor={dropzoneInputId} className="sr-only">
        {mainMessage}
      </label>
      <input {...getInputProps({ id: dropzoneInputId })} />
      <ImageIcon
        className={`w-8 h-8 ${isCompressing ? 'animate-pulse ' : ''}${
          isDragHighlight ? 'text-gray-900' : 'text-gray-400'
        }`}
      />
      <div className="text-center">
        <p
          className={`text-sm font-medium ${
            isDragHighlight ? 'text-gray-900' : 'text-gray-600'
          }`}
        >
          {mainMessage}
        </p>
        <p className="text-xs text-gray-400 mt-1">{getSubMessage()}</p>
      </div>
    </div>
  );
}
