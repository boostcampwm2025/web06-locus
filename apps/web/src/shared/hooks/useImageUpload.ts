/**
 * 이미지 업로드 훅
 * 이미지 선택, 검증, 압축, 미리보기를 관리합니다.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  UseImageUploadOptions,
  UseImageUploadReturn,
} from '@/shared/types';
import { logger } from '../utils/logger';
import { validateImageFiles } from '../utils/imageValidation';
import { compressImages } from '../utils/imageResize';

export type {
  UseImageUploadOptions,
  UseImageUploadReturn,
} from '@/shared/types';

/**
 * 이미지 업로드 훅
 */
export function useImageUpload(
  options: UseImageUploadOptions = {},
): UseImageUploadReturn {
  const {
    maxFiles = 5, // API 서버의 MAX_FILE_COUNT와 동일
    compressionOptions,
    enableCompression = true,
    onFilesSelected,
    onValidationError,
  } = options;

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // 언마운트 시 URL 정리를 위한 ref (렌더링에는 사용하지 않음)
  const previewUrlsRef = useRef<string[]>([]);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const validationError = validateImageFiles(
        files,
        selectedImages.length,
        maxFiles,
      );
      if (validationError) {
        onValidationError?.(validationError);
        return;
      }

      setIsCompressing(true);

      try {
        const processedFiles = enableCompression
          ? await compressImages(files, compressionOptions)
          : files;

        // 새 파일에 대해서만 URL 생성
        const newUrls = processedFiles.map((file) => URL.createObjectURL(file));

        // 언마운트 정리를 위한 ref 동기화
        setPreviewUrls((prev) => {
          const updatedUrls = [...prev, ...newUrls];
          previewUrlsRef.current = updatedUrls;
          return updatedUrls;
        });
        setSelectedImages((prev) => [...prev, ...processedFiles]);
        onFilesSelected?.(processedFiles);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(err, {
          context: 'useImageUpload',
          action: 'handleFilesSelected',
          fileCount: files.length,
        });
        onValidationError?.({
          type: 'INVALID_TYPE',
          message: '파일 처리 중 오류 발생',
        });
      } finally {
        setIsCompressing(false);
      }
    },
    [
      selectedImages.length,
      maxFiles,
      enableCompression,
      compressionOptions,
      onFilesSelected,
      onValidationError,
    ],
  );

  /**
   * 파일 제거 핸들러 (개선 버전)
   */
  const handleRemoveFile = useCallback((index: number) => {
    // 지워지는 파일만 메모리에서 해제
    setPreviewUrls((prev) => {
      const targetUrl = prev[index];

      if (targetUrl) URL.revokeObjectURL(targetUrl);
      const newUrls = prev.filter((_, i) => i !== index);
      previewUrlsRef.current = newUrls; // 언마운트 정리를 위한 ref 동기화
      return newUrls;
    });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 모든 파일 제거
   */
  const handleClearFiles = useCallback(() => {
    setPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      // ref 동기화
      previewUrlsRef.current = [];
      return [];
    });
    setSelectedImages([]);
  }, []);

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    return () => {
      // 최종적으로 남은 모든 URL 해제
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      previewUrlsRef.current = [];
    };
  }, []);

  return {
    selectedImages,
    previewUrls,
    isUploading: false,
    isCompressing,
    handleFilesSelected,
    handleRemoveFile,
    handleClearFiles,
    cleanup: handleClearFiles,
  };
}
