import { z } from 'zod';

/**
 * 위치 정보 스키마 (camelCase)
 *
 * @usedIn Request 및 Response 스키마의 location 필드에서 사용
 * @api GET /records, POST /records, PATCH /records/{public_id}, GET /records/{publicId}/graph/records
 */
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().nullable(),
  name: z.string().nullable().optional(),
});

/**
 * 위치 정보 스키마 (좌표 없음, camelCase)
 *
 * @usedIn GET /records/all 응답의 location 필드에서 사용
 * @api GET /records/all - 좌표값은 포함하지 않음
 */
export const LocationWithoutCoordsSchema = z.object({
  name: z.string().nullable(),
  address: z.string().nullable(),
});

/**
 * 이미지 크기 정보 스키마 (Response용 - camelCase)
 *
 * @usedIn ImageResponseSchema의 thumbnail, medium, original 필드에서 사용
 * @api POST /records, POST /records/with-presigned-images, PATCH /records/{public_id}
 *
 * @note Presigned 방식에서는 Cloud Function이 메타데이터를 추출하기 전까지 width/height/size가 null
 */
export const ImageSizeResponseSchema = z.object({
  url: z.string().url(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  size: z.number().nullable(),
});

/**
 * 이미지 스키마 (Response용 - camelCase)
 *
 * @usedIn RecordWithImagesResponseSchema의 images 필드에서 사용
 * @api POST /records, POST /records/with-presigned-images, PATCH /records/{public_id}
 *
 * @note Presigned 방식에서는 리사이징 완료 전까지 thumbnail/medium이 null
 * @note 백엔드는 status 필드를 반환하지만, 프론트엔드에서는 사용하지 않으므로 스키마에서 제외
 */
export const ImageResponseSchema = z.object({
  publicId: z.string(),
  thumbnail: ImageSizeResponseSchema.nullable(),
  medium: ImageSizeResponseSchema.nullable(),
  original: ImageSizeResponseSchema,
  order: z.number(),
});

/**
 * 페이지네이션 스키마 (커서 기반, Response용 - camelCase)
 *
 * @api GET /records/search - 응답의 pagination 필드
 */
export const CursorPaginationResponseSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().nullable(),
  totalCount: z.number(),
});

/**
 * 페이지네이션 스키마 (offset 기반, camelCase)
 *
 * @api GET /records - 응답의 data.totalCount 필드
 */
export const OffsetPaginationSchema = z.object({
  totalCount: z.number(),
});

/**
 * API 응답 기본 구조 (성공)
 * message는 optional로 설정 (실제 API 응답에 따라 다를 수 있음)
 *
 * @usedIn 모든 성공 응답 스키마의 기본 구조
 */
export const SuccessResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
});

/**
 * API 응답 기본 구조 (실패)
 *
 * @usedIn 모든 실패 응답 스키마의 기본 구조 (400, 401, 404 등)
 */
export const FailResponseSchema = z.object({
  status: z.literal('fail'),
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

/**
 * API 응답 기본 구조 (에러)
 *
 * @usedIn 모든 서버 에러 응답 스키마의 기본 구조 (500)
 */
export const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
