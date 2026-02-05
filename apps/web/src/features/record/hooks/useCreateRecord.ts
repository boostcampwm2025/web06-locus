import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRecord,
  generateUploadUrls,
  uploadImageToObjectStorage,
  createRecordWithPresignedImages,
} from '@/infra/api/services/recordService';
import {
  PresignedUrlGenerationError,
  ImageUploadError,
  RecordCreationError,
} from '@/shared/errors';
import type { CreateRecordRequest, RecordWithImages } from '@locus/shared';
import { useBlobPreviewStore } from '../domain/blobPreviewStore';

interface CreateRecordParams {
  request: CreateRecordRequest;
  images?: File[];
  previewUrls?: string[];
}

/**
 * 기록 생성 React Query Hook
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation<RecordWithImages, Error, CreateRecordParams>({
    mutationFn: async ({ request, images = [] }) => {
      // 이미지 없으면 기존 FormData 방식
      if (images.length === 0) {
        return createRecord(request, images);
      }

      // 이미지 있으면 Presigned URL 방식
      let recordPublicId: string;
      let uploads: { imageId: string; uploadUrl: string; key: string }[];

      // Step 1: Presigned URL 생성
      try {
        const result = await generateUploadUrls(images.length);
        recordPublicId = result.recordPublicId;
        uploads = result.uploads;
      } catch (error) {
        throw new PresignedUrlGenerationError(
          '이미지 업로드 URL 생성에 실패했습니다.',
          error,
        );
      }

      // Step 2: Object Storage 업로드 (병렬)
      try {
        await Promise.all(
          uploads.map((upload, index) =>
            uploadImageToObjectStorage(upload.uploadUrl, images[index]),
          ),
        );
      } catch (error) {
        throw new ImageUploadError(
          '이미지 업로드에 실패했습니다.',
          undefined,
          error,
        );
      }

      // Step 3: 기록 생성
      try {
        return await createRecordWithPresignedImages({
          recordPublicId,
          imageIds: uploads.map((u) => u.imageId),
          ...request,
        });
      } catch (error) {
        throw new RecordCreationError('기록 생성에 실패했습니다.', error);
      }
    },
    onSuccess: (data, variables) => {
      // Blob URL을 Store에 저장 (React Query 캐시와 분리)
      if (variables.previewUrls?.[0]) {
        useBlobPreviewStore
          .getState()
          .setBlobUrl(data.publicId, variables.previewUrls[0]);
      }

      // React Query 캐시 업데이트 (순수한 서버 데이터만)
      queryClient.setQueryData<RecordWithImages[]>(['records'], (old = []) => [
        data,
        ...old,
      ]);

      queryClient.setQueryData<RecordWithImages>(
        ['record', 'detail', data.publicId],
        data,
      );
    },
  });
}
