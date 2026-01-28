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
 * 이미지 크기 정보 스키마 (Response용 - camelCase)
 *
 * @usedIn ImageResponseSchema의 thumbnail, medium, original 필드에서 사용
 * @api POST /records, PATCH /records/{public_id} - 응답의 images 배열 아이템
 */
export const ImageSizeResponseSchema = z.object({
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
});

/**
 * 이미지 스키마 (Response용 - camelCase)
 *
 * @usedIn RecordWithImagesResponseSchema의 images 필드에서 사용
 * @api POST /records, PATCH /records/{public_id} - 응답의 record.images 배열 아이템
 */
export const ImageResponseSchema = z.object({
  publicId: z.string(),
  thumbnail: ImageSizeResponseSchema,
  medium: ImageSizeResponseSchema,
  original: ImageSizeResponseSchema,
  order: z.number(),
});

/**
 * 페이지네이션 스키마 (커서 기반, Response용 - camelCase)
 *
 * @api GET /records/search - 응답의 pagination 필드
 */
export const CursorPaginationResponseSchema = z.object({
  hasMore: z.boolean().optional(),
  nextCursor: z.string().optional(),
  hasNext: z.boolean().optional(),
  limit: z.number().optional(),
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
