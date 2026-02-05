import type { Record as ApiRecord } from '@locus/shared';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import { extractTagNames } from './tagUtils';

/**
 * UI에서 사용할 기록 데이터 타입
 */
export interface UIRecord {
  id: string;
  title: string;
  location: {
    name: string;
    address: string;
  };
  date: Date;
  tags: string[];
  imageUrl?: string;
  /** 연결된 기록 개수 (all/검색 API 등에서 제공) */
  connectionCount?: number;
  /** 즐겨찾기 여부 (GET /records/all 등에서 제공) */
  isFavorite?: boolean;
}

/**
 * API 응답의 Record를 UI용 데이터로 변환
 * @param record API 응답의 Record 객체
 * @returns UI에서 사용할 Record 객체
 */
export function transformRecordApiToUI(record: ApiRecord): UIRecord {
  const recordWithImages = record as ApiRecord & {
    images?: {
      thumbnail: { url: string };
      medium: { url: string };
      original: { url: string };
    }[];
  };

  const thumbnailUrl =
    recordWithImages.images && recordWithImages.images.length > 0
      ? recordWithImages.images[0].thumbnail?.url
      : RECORD_PLACEHOLDER_IMAGE;

  return {
    id: record.publicId,
    title: record.title,
    location: {
      name: record.location.name ?? '',
      address: record.location.address ?? '',
    },
    date: new Date(record.createdAt),
    tags: extractTagNames(record.tags),
    imageUrl: thumbnailUrl,
  };
}
