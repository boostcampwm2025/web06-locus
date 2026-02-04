import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';
import {
  CreateRecordRequestSchema,
  CreateRecordResponseSchema,
  GetRecordsByBoundsRequestSchema,
  GetAllRecordsRequestSchema,
  GetAllRecordsResponseSchema,
  RecordsByBoundsResponseSchema,
  RecordDetailResponseSchema,
  SuccessResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type {
  CreateRecordRequest,
  CreateRecordWithPresignedRequest,
  RecordWithImages,
  GetRecordsByBoundsRequest,
  GetAllRecordsRequest,
  Record,
  RecordWithoutCoords,
  RecordDetail,
} from '@locus/shared';

import { z } from 'zod';
import { logger } from '@/shared/utils/logger';

/**
 * 기록 생성 API 호출
 * - 이미지 없으면: JSON body
 * - 이미지 있으면: FormData (data + images[])
 */
export async function createRecord(
  request: CreateRecordRequest,
  images: File[] = [],
): Promise<RecordWithImages> {
  // 1. Request 검증
  const validatedRequest = CreateRecordRequestSchema.parse(request);

  // 2. API payload 구성
  const payload = buildCreateRecordPayload(validatedRequest);

  // 3. 이미지 유무와 상관없이 FormData로 전송
  const response = await postCreateRecordAsFormData(payload, images);

  // 4. Response 검증
  return parseCreateRecordResponse(response);
}

/**
 * 기록 삭제 API 호출
 * - 기록과 연결된 모든 연결도 함께 삭제됨
 */
export async function deleteRecord(publicId: string): Promise<void> {
  await apiClient<void>(API_ENDPOINTS.RECORDS_BY_ID(publicId), {
    method: 'DELETE',
  });
}

/**
 * 지도 범위 기반 기록 조회 API 호출
 * - GET /records?neLat=&neLng=&swLat=&swLng=&page=&limit=&sortOrder=
 */
export async function getRecordsByBounds(
  request: GetRecordsByBoundsRequest,
): Promise<{ records: Record[]; totalCount: number }> {
  // 1. Request 검증
  const validatedRequest = GetRecordsByBoundsRequestSchema.parse(request);

  // 2. Bounds 유효성 검사
  // 반올림으로 인해 같은 값이 될 수 있으므로 최소 차이(0.0001)를 보장
  // 지도가 처음 로드될 때 높이가 0이면 같은 값이 들어올 수 있으므로
  // 에러를 던지지 않고 빈 결과를 반환하여 컴포넌트 크래시 방지
  const MIN_BOUNDS_DIFF = 0.0001;

  if (validatedRequest.neLat - validatedRequest.swLat < MIN_BOUNDS_DIFF) {
    logger.warn(
      'Invalid bounds: neLat and swLat가 너무 가까워서 기록 조회 불가',
      {
        neLat: validatedRequest.neLat,
        swLat: validatedRequest.swLat,
        diff: validatedRequest.neLat - validatedRequest.swLat,
        sendToSentry: false, // 빈번한 경고이므로 Sentry 전송 비활성화
      },
    );
    return { records: [], totalCount: 0 };
  }
  if (validatedRequest.neLng - validatedRequest.swLng < MIN_BOUNDS_DIFF) {
    logger.warn(
      'Invalid bounds: neLng and swLng가 너무 가까워서 기록 조회 불가',
      {
        neLng: validatedRequest.neLng,
        swLng: validatedRequest.swLng,
        diff: validatedRequest.neLng - validatedRequest.swLng,
        sendToSentry: false, // 빈번한 경고이므로 Sentry 전송 비활성화
      },
    );
    return { records: [], totalCount: 0 };
  }

  // 3. Query 파라미터 구성 (소수점 4자리로 고정)
  const queryParams = new URLSearchParams({
    neLat: Number(validatedRequest.neLat).toFixed(4),
    neLng: Number(validatedRequest.neLng).toFixed(4),
    swLat: Number(validatedRequest.swLat).toFixed(4),
    swLng: Number(validatedRequest.swLng).toFixed(4),
    page: (validatedRequest.page ?? 1).toString(),
    limit: (validatedRequest.limit ?? 10).toString(),
    sortOrder: validatedRequest.sortOrder ?? 'desc',
  });

  // 3. API 호출
  const response = await apiClient<unknown>(
    `${API_ENDPOINTS.RECORDS}?${queryParams.toString()}`,
    {
      method: 'GET',
    },
  );

  // 4. Response 검증 + data 추출
  try {
    const validated = validateApiResponse(
      RecordsByBoundsResponseSchema,
      response,
    );
    return validated.data;
  } catch (error) {
    // 스키마 검증 실패 시 상세 로깅
    logger.error(
      error instanceof Error ? error : new Error('Schema validation failed'),
      {
        schema: 'RecordsByBoundsResponseSchema',
        request: validatedRequest,
        responseData: response,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    );

    // 개발 환경에서는 에러를 던져서 문제를 빠르게 발견
    // 프로덕션에서는 빈 결과를 반환하여 앱 크래시 방지
    if (import.meta.env.DEV) {
      throw error;
    }

    return { records: [], totalCount: 0 };
  }
}

/**
 * 전체 기록 조회 API 호출
 * - GET /records/all?page=&limit=&sortOrder=&startDate=&endDate=&tagPublicIds=
 */
export async function getAllRecords(
  request: GetAllRecordsRequest,
): Promise<{ records: RecordWithoutCoords[]; totalCount: number }> {
  try {
    // 1. Request 검증
    const validatedRequest = GetAllRecordsRequestSchema.parse(request);

    // 2. Query 파라미터 구성
    const queryParams = new URLSearchParams({
      page: (validatedRequest.page ?? 1).toString(),
      limit: (validatedRequest.limit ?? 10).toString(),
      sortOrder: validatedRequest.sortOrder ?? 'desc',
    });

    if (validatedRequest.startDate)
      queryParams.append('startDate', validatedRequest.startDate);
    if (validatedRequest.endDate)
      queryParams.append('endDate', validatedRequest.endDate);

    if (validatedRequest.tagPublicIds?.length) {
      queryParams.append(
        'tagPublicIds',
        validatedRequest.tagPublicIds.join(','),
      );
    }

    // 3. API 호출
    const response = await apiClient<unknown>(
      `${API_ENDPOINTS.RECORDS_ALL}?${queryParams.toString()}`,
      { method: 'GET' },
    );

    // 4. Response 검증

    const validated = validateApiResponse(
      GetAllRecordsResponseSchema,
      response,
    );

    return validated.data;
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error('전체 기록 조회 실패'),
      {
        request,
        error: String(error),
      },
    );
    throw error;
  }
}

/**
 * 기록 상세 조회 API 호출
 * - GET /records/{publicId}
 */
export async function getRecordDetail(publicId: string): Promise<RecordDetail> {
  try {
    logger.info('기록 상세 조회 시작', { publicId });

    // 1. API 호출
    const response = await apiClient<unknown>(
      API_ENDPOINTS.RECORDS_BY_ID(publicId),
      {
        method: 'GET',
      },
    );

    // 2. Response 검증 + data 추출
    const validated = validateApiResponse<
      z.infer<typeof RecordDetailResponseSchema>
    >(RecordDetailResponseSchema, response);

    logger.info('기록 상세 조회 성공', { publicId });
    return validated.data;
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error('기록 상세 조회 실패'),
      {
        publicId,
        error: String(error),
      },
    );
    throw error;
  }
}

/**
 * 기록 즐겨찾기 변경 API 호출
 * - PATCH /records/{publicId}/favorite
 */
export async function updateRecordFavorite(
  publicId: string,
  isFavorite: boolean,
): Promise<{ publicId: string; isFavorite: boolean }> {
  try {
    logger.info('기록 즐겨찾기 변경 시작', { publicId, isFavorite });

    // 1. API 호출
    const response = await apiClient<unknown>(
      API_ENDPOINTS.RECORDS_FAVORITE(publicId),
      {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // 2. Response 검증
    const FavoriteResponseSchema = SuccessResponseSchema.extend({
      data: z.object({
        publicId: z.string(),
        isFavorite: z.boolean(),
      }),
    });

    const validated = validateApiResponse(
      FavoriteResponseSchema,
      response,
    ) as z.infer<typeof FavoriteResponseSchema>;

    logger.info('기록 즐겨찾기 변경 성공', {
      publicId,
      isFavorite: validated.data.isFavorite,
    });

    return validated.data;
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error('기록 즐겨찾기 변경 실패'),
      {
        publicId,
        isFavorite,
        error: String(error),
      },
    );
    throw error;
  }
}

/**
 * API로 전송할 CreateRecord payload 생성
 * (전송 필드만 명시적으로 구성)
 */
function buildCreateRecordPayload(request: CreateRecordRequest) {
  return {
    title: request.title,
    content: request.content,
    location: {
      latitude: request.location.latitude,
      longitude: request.location.longitude,
    },
    tags: request.tags ?? [],
  };
}

/**
 * FormData 방식으로 기록 생성 요청
 * - data: JSON 문자열
 * - images: 파일 배열
 */
async function postCreateRecordAsFormData(
  payload: unknown,
  images: File[],
): Promise<unknown> {
  const formData = new FormData();

  formData.append('data', JSON.stringify(payload));

  if (images && images.length > 0) {
    // 이미지 크기 로깅 (압축 확인용)
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const avgSize = totalSize / images.length;
    logger.info('이미지 업로드 시작', {
      imageCount: images.length,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      avgSizeMB: (avgSize / (1024 * 1024)).toFixed(2),
    });

    images.forEach((image) => {
      formData.append('images', image);
    });
  }

  return await apiClient<unknown>(API_ENDPOINTS.RECORDS, {
    method: 'POST',
    body: formData,
  });
}

/**
 * 응답 검증 후 RecordWithImages 반환
 */
function parseCreateRecordResponse(response: unknown): RecordWithImages {
  const validated = validateApiResponse(CreateRecordResponseSchema, response);
  return validated.data;
}

/**
 * Presigned URL 생성 API 호출
 * @param count 업로드할 이미지 개수 (1-5)
 * @returns recordPublicId와 각 이미지별 uploadUrl, imageId
 */
export async function generateUploadUrls(count: number): Promise<{
  recordPublicId: string;
  uploads: {
    imageId: string;
    uploadUrl: string;
    key: string;
  }[];
}> {
  logger.info('Presigned URL 생성 요청', { count });

  const response = await apiClient<unknown>(API_ENDPOINTS.RECORDS_UPLOAD_URLS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count }),
  });

  // 응답 스키마 정의 (백엔드 GenerateUploadUrlsResponseDto와 일치)
  const GenerateUploadUrlsResponseSchema = z.object({
    recordPublicId: z.string(),
    uploads: z.array(
      z.object({
        imageId: z.string(),
        uploadUrl: z.string().url(),
        key: z.string(),
      }),
    ),
  });

  const validated = GenerateUploadUrlsResponseSchema.parse(response);

  logger.info('Presigned URL 생성 성공', {
    recordPublicId: validated.recordPublicId,
    uploadCount: validated.uploads.length,
  });

  return validated;
}

/**
 * Presigned URL을 사용하여 이미지를 Object Storage에 직접 업로드
 * @param presignedUrl Object Storage Presigned URL
 * @param file 업로드할 파일
 */
export async function uploadImageToObjectStorage(
  presignedUrl: string,
  file: File,
): Promise<void> {
  logger.info('Object Storage 이미지 업로드 시작', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `Object Storage 업로드 실패: ${response.status} ${response.statusText}`,
      );
    }

    logger.info('Object Storage 이미지 업로드 성공', {
      fileName: file.name,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error('Object Storage 업로드 실패'),
      {
        fileName: file.name,
        error: String(error),
      },
    );
    throw error;
  }
}

/**
 * Presigned URL 방식으로 기록 생성 API 호출
 * @param params recordPublicId, imageIds, title, content, location, tags
 * @returns 생성된 기록 정보
 */
export async function createRecordWithPresignedImages(
  params: CreateRecordWithPresignedRequest,
): Promise<RecordWithImages> {
  logger.info('Presigned 방식 기록 생성 시작', {
    recordPublicId: params.recordPublicId,
    imageCount: params.imageIds.length,
  });

  const response = await apiClient<unknown>(
    API_ENDPOINTS.RECORDS_WITH_PRESIGNED,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
  );

  // 응답 검증 (기존 CreateRecordResponseSchema 재사용)
  const validated = validateApiResponse(CreateRecordResponseSchema, response);

  logger.info('Presigned 방식 기록 생성 성공', {
    recordPublicId: validated.data.publicId,
  });

  return validated.data;
}
