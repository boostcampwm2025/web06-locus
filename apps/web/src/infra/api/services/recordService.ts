import { apiClient } from '../index';
import { API_ENDPOINTS } from '../constants';
import {
  CreateRecordRequestSchema,
  CreateRecordResponseSchema,
  GetRecordsByBoundsRequestSchema,
  RecordsByBoundsResponseSchema,
  RecordDetailResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type {
  CreateRecordRequest,
  RecordWithImages,
  GetRecordsByBoundsRequest,
  Record,
  RecordDetail,
} from '@locus/shared';
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

  // 2. Query 파라미터 구성
  const queryParams = new URLSearchParams({
    neLat: validatedRequest.neLat.toString(),
    neLng: validatedRequest.neLng.toString(),
    swLat: validatedRequest.swLat.toString(),
    swLng: validatedRequest.swLng.toString(),
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
  const validated = validateApiResponse(
    RecordsByBoundsResponseSchema,
    response,
  );
  return validated.data;
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
    const validated = validateApiResponse(RecordDetailResponseSchema, response);

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
