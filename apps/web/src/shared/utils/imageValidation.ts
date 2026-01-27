/**
 * 이미지 파일 검증 유틸리티
 */

import type { ImageValidationError } from '@/shared/types';

/**
 * 허용되는 이미지 MIME 타입
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/**
 * 허용되는 이미지 확장자
 */
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
] as const;

/**
 * 최대 파일 크기 (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 최대 파일 개수 (5개)
 * API 서버의 multer.config.ts와 동일하게 설정
 */
const MAX_FILE_COUNT = 5;

/**
 * 파일이 이미지 타입인지 확인
 * HEIC/HEIF 파일의 경우 브라우저가 MIME 타입을 빈 문자열로 반환할 수 있으므로
 * 확장자 체크를 우선적으로 수행합니다.
 */
export function isValidImageType(file: File): boolean {
  const isMimeTypeEmpty = !file.type?.trim(); // Optional chaining과 truthy 체크 활용
  const hasAllowedMimeType = ALLOWED_IMAGE_TYPES.includes(
    file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
  );
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  // 타입이 비어있으면 확장자만 보고, 타입이 있으면 타입이나 확장자 중 하나만 맞아도 통과
  return isMimeTypeEmpty
    ? hasAllowedExtension
    : hasAllowedMimeType || hasAllowedExtension;
}

/**
 * 파일 크기가 유효한지 확인
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * 이미지 파일 검증
 * @param file 검증할 파일
 * @returns 검증 성공 시 null, 실패 시 에러 정보
 */
export function validateImageFile(file: File): ImageValidationError | null {
  // 타입 검증
  if (!isValidImageType(file)) {
    return {
      type: 'INVALID_TYPE',
      message: `지원하지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')}만 가능)`,
    };
  }

  // 크기 검증
  if (!isValidFileSize(file)) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      type: 'INVALID_SIZE',
      message: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`,
    };
  }

  return null;
}

/**
 * 여러 이미지 파일 검증
 * @param files 검증할 파일 배열
 * @param currentFileCount 현재 이미 선택된 파일 개수 (기본값: 0)
 * @param maxFiles 최대 파일 개수 (기본값: MAX_FILE_COUNT)
 * @returns 검증 성공 시 null, 실패 시 첫 번째 에러 정보
 */
export function validateImageFiles(
  files: File[],
  currentFileCount = 0,
  maxFiles = MAX_FILE_COUNT,
): ImageValidationError | null {
  // 파일 개수 검증 (현재 선택된 파일과 합산)
  const totalFiles = currentFileCount + files.length;
  if (totalFiles > maxFiles) {
    return {
      type: 'TOO_MANY_FILES',
      message: `최대 ${maxFiles}개의 파일만 선택할 수 있습니다. (현재 ${currentFileCount}개 + 추가 ${files.length}개)`,
    };
  }

  // 각 파일 검증
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) {
      return error;
    }
  }

  return null;
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @example formatFileSize(1024) => '1 KB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
