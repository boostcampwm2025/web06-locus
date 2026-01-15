import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  CreateRecordRequestSchema,
  CreateRecordResponseSchema,
  validateApiResponse,
} from '@locus/shared';
import type { CreateRecordRequest, RecordWithImages } from '@locus/shared';

/**
 * 기록 생성 API 호출
 * - 이미지 없으면: JSON body
 * - 이미지 있으면: FormData (data + images[])
 */
export async function createRecord(
  request: CreateRecordRequest,
  images: File[] = [],
): Promise<RecordWithImages> {
  // 1. Request 검증 (서버 보내기 전에 프론트에서 계약 보장)
  const validatedRequest = CreateRecordRequestSchema.parse(request);

  // 2. API로 보낼 payload 구성 (UI/도메인 데이터와 전송 데이터 분리)
  const payload = buildCreateRecordPayload(validatedRequest);

  // 3. 전송 방식 분기
  const response =
    images.length === 0
      ? await postCreateRecordAsJson(payload)
      : await postCreateRecordAsFormData(payload, images);

  // 4. Response 검증 + data 추출
  return parseCreateRecordResponse(response);
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
 * JSON 방식으로 기록 생성 요청
 * (백엔드가 @Body()로 직접 받는 경우)
 */
async function postCreateRecordAsJson(payload: unknown): Promise<unknown> {
  return await apiClient<unknown>(API_ENDPOINTS.RECORDS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

  // JSON을 별도 필드로 담는다 (서버에서 'data'를 파싱)
  formData.append('data', JSON.stringify(payload));

  // 이미지 파일 추가 (같은 key로 여러 번 append → files[]로 수신)
  images.forEach((image) => {
    formData.append('images', image);
  });

  // FormData는 Content-Type을 직접 설정하면 안 됨 (boundary는 브라우저가 설정)
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
