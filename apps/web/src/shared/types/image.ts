/**
 * 이미지 압축 옵션
 */
export interface ImageCompressionOptions {
  maxSizeMB?: number /** 최대 파일 크기 (MB) */;
  maxWidthOrHeight?: number /** 최대 너비 (px) */;
  initialQuality?: number /** 이미지 품질 (0-1) */;
  alwaysKeepResolution?: boolean /** 항상 압축할지 여부 (원본이 작아도 압축) */;
}

/**
 * 이미지 검증 에러
 */
export interface ImageValidationError {
  type: 'INVALID_TYPE' | 'INVALID_SIZE' | 'TOO_MANY_FILES';
  message: string;
}

/**
 * useImageUpload 훅 옵션
 */
export interface UseImageUploadOptions {
  maxFiles?: number /** 최대 파일 개수 */;
  compressionOptions?: ImageCompressionOptions /** 압축 옵션 */;
  enableCompression?: boolean /** 압축 사용 여부 */;
  onFilesSelected?: (files: File[]) => void /** 파일 선택 시 호출되는 콜백 */;
  onValidationError?: (
    error: ImageValidationError,
  ) => void /** 파일 검증 실패 시 호출되는 콜백 */;
}

/**
 * useImageUpload 훅 반환값
 */
export interface UseImageUploadReturn {
  selectedImages: File[] /** 선택된 이미지 파일 배열 */;
  previewUrls: string[] /** 이미지 미리보기 URL 배열 */;
  isUploading: boolean /** 업로드 중인지 여부 */;
  isCompressing: boolean /** 압축 중인지 여부 */;
  handleFilesSelected: (files: File[]) => Promise<void> /** 파일 선택 핸들러 */;
  handleRemoveFile: (index: number) => void /** 파일 제거 핸들러 */;
  handleClearFiles: () => void /** 모든 파일 제거 */;
  cleanup: () => void /** 미리보기 URL 정리 (컴포넌트 언마운트 시 호출) */;
}
