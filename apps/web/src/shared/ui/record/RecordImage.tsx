import { useState, useMemo, useEffect } from 'react';
import { ImageWithFallback } from '@/shared/ui/image';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import { useBlobPreviewStore } from '@/features/record/domain/blobPreviewStore';
import type { Image } from '@locus/shared';

interface RecordImageProps {
  recordId: string;
  image?: Image;
  alt: string;
  className?: string;
}

/**
 * 기록 이미지 컴포넌트
 *
 * 표시 우선순위:
 * 1. cachedBlobUrl (컴포넌트 state에 캐시된 Blob URL)
 * 2. thumbnail.url (리사이징 완료 후)
 * 3. RECORD_PLACEHOLDER_IMAGE (디폴트)
 *
 * 핵심 메커니즘:
 * - Store에서 Blob URL 조회 (기록 생성 직후에만 존재)
 * - useState로 첫 렌더링 시 Blob URL 캐시
 * - invalidate로 Store가 업데이트돼도 cachedBlobUrl은 유지됨
 * - thumbnail 로드되면 cachedBlobUrl을 정리하고 thumbnail로 전환
 */
export function RecordImage({
  recordId,
  image,
  alt,
  className,
}: RecordImageProps) {
  // Store에서 첫 번째 Blob URL 조회 (단일 이미지 썸네일용)
  const getBlobUrls = useBlobPreviewStore((state) => state.getBlobUrls);
  const localPreviewUrls = getBlobUrls(recordId);

  // 핵심: useState로 첫 번째 Blob URL 캐시 (첫 렌더링 시에만 실행)
  const [cachedBlobUrl] = useState(() => localPreviewUrls[0]);

  const imgSrc = useMemo(() => {
    // 1순위: 캐시된 Blob URL (invalidate 후에도 유지됨)
    if (cachedBlobUrl) {
      return cachedBlobUrl;
    }

    // 2순위: Thumbnail URL (리사이징 완료)
    if (image?.thumbnail?.url) {
      return image.thumbnail.url;
    }

    // 3순위: 디폴트 이미지
    return RECORD_PLACEHOLDER_IMAGE;
  }, [cachedBlobUrl, image?.thumbnail?.url]);

  // Cleanup: thumbnail 로드되면 Store에서 정리
  useEffect(() => {
    if (cachedBlobUrl && image?.thumbnail?.url) {
      // thumbnail이 로드되었으므로 Store에서 Blob URL 정리
      // 다른 컴포넌트도 사용할 수 있으므로 Store에서 중앙 관리
      const cleanup = useBlobPreviewStore.getState().cleanup;
      cleanup(recordId);
    }
  }, [cachedBlobUrl, image?.thumbnail?.url, recordId]);

  return <ImageWithFallback src={imgSrc} alt={alt} className={className} />;
}
