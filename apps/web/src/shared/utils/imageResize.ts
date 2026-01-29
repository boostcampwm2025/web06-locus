import imageCompression from 'browser-image-compression';
import type { ImageCompressionOptions } from '@/shared/types';

/**
 * 기본 압축 옵션
 */
const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 2, // 2MB
  maxWidthOrHeight: 1920, // 최대 1920px
  initialQuality: 0.8, // 80% 품질
  alwaysKeepResolution: false,
};

/**
 * 이미지 파일 압축
 * @param file 압축할 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 이미지 파일
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<File> {
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: compressionOptions.maxSizeMB,
      maxWidthOrHeight: compressionOptions.maxWidthOrHeight,
      initialQuality: compressionOptions.initialQuality,
      alwaysKeepResolution: compressionOptions.alwaysKeepResolution,
      useWebWorker: true, // 웹 워커 사용으로 메인 스레드 블로킹 방지
    });

    return compressedFile;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    // 압축 실패 시 원본 파일 반환
    return file;
  }
}

/**
 * 여러 이미지 파일 압축 (동시성 제한)
 * 모바일 환경에서 메모리 부족을 방지하기 위해 동시에 처리하는 파일 수를 제한합니다.
 * @param files 압축할 이미지 파일 배열
 * @param options 압축 옵션
 * @param concurrency 동시에 처리할 최대 파일 수 (기본값: 2)
 * @returns 압축된 이미지 파일 배열
 */
export async function compressImages(
  files: File[],
  options: ImageCompressionOptions = {},
  concurrency = 2,
): Promise<File[]> {
  const compressedFiles: File[] = [];

  // 동시성 제한을 두고 배치로 처리
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((file) => compressImage(file, options)),
    );
    compressedFiles.push(...batchResults);
  }

  return compressedFiles;
}
