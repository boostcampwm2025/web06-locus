import { z } from 'zod';
import {
  LocationSchema,
  LocationWithoutCoordsSchema,
  ImageResponseSchema,
  SuccessResponseSchema,
  FailResponseSchema,
  ErrorResponseSchema,
  CursorPaginationResponseSchema,
} from './common.schema';

// ============================================================================
// 공통 스키마 (Response용)
// ============================================================================

/**
 * 태그 스키마 (상세 조회용 - Response용 - camelCase)
 * 기록 생성/수정 응답에서도 사용됨
 *
 * @api POST /records - 기록 생성 응답의 data.tags 배열 아이템
 * @api PATCH /records/{public_id} - 기록 수정 응답의 data.tags 배열 아이템
 * @api GET /records/{publicId} - 응답의 record.tags 배열 아이템
 * @api GET /records - 지도 범위 기반 기록 조회 응답의 tags 배열 아이템
 */
export const TagDetailResponseSchema = z.object({
  publicId: z.string(),
  name: z.string(),
});

/**
 * 기본 기록 스키마 (Response용 - camelCase)
 * connections 필드는 GET /records/{publicId}/graph와 GET /records/{publicId}/graph/records에서만 관리됨
 *
 * @api GET /records - 지도 범위 기반 기록 조회 응답에 사용
 * 백엔드는 태그를 객체 배열로 반환함 (RecordTagDto[])
 */
export const RecordResponseSchema = z.object({
  publicId: z.string(),
  title: z.string(),
  content: z.string().nullable().optional(),
  location: LocationSchema,
  tags: z.array(TagDetailResponseSchema),
  images: z.array(ImageResponseSchema).optional(),
  isFavorite: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * 기록 생성/수정 응답용 기록 스키마 (이미지 포함, Response용 - camelCase)
 *
 * @api POST /records - 기록 생성 응답에 사용
 * @api PATCH /records/{public_id} - 기록 수정 응답에 사용
 */
export const RecordWithImagesResponseSchema = RecordResponseSchema.extend({
  userId: z.string().optional(),
  images: z.array(ImageResponseSchema),
  isFavorite: z.boolean(),
}).extend({
  // 백엔드는 태그를 객체 배열로 반환함 (RecordTagDto[])
  tags: z.array(TagDetailResponseSchema),
});

// ============================================================================
// Request 스키마 (BE 입력 검증용)
// ============================================================================

/**
 * 지도 범위 기반 기록 조회 Request (Query Parameters)
 *
 * @api GET /records
 */
export const GetRecordsByBoundsRequestSchema = z.object({
  neLat: z.number().min(-90).max(90),
  neLng: z.number().min(-180).max(180),
  swLat: z.number().min(-90).max(90),
  swLng: z.number().min(-180).max(180),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(10),
  sortOrder: z.enum(['desc', 'asc']).optional().default('desc'),
});

/**
 * 기록 검색 Request (Query Parameters)
 *
 * @api GET /records/search
 */
export const SearchRecordsRequestSchema = z.object({
  keyword: z.string().min(1),
  tags: z.array(z.string()).optional(),
  sortOrder: z.enum(['desc', 'asc']).optional(),
  hasImage: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  cursor: z.string().optional(),
  size: z.number().int().min(1).optional(),
});

/**
 * 전체 기록 조회 Request (Query Parameters)
 *
 * @api GET /records/all
 */
export const GetAllRecordsRequestSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(10),
  sortOrder: z.enum(['desc', 'asc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tagPublicIds: z.array(z.string()).optional(),
});

/**
 * 기록 생성 Request (Multipart Form Data의 data 필드)
 *
 * @api POST /records
 */
export const CreateRecordRequestSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(500).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  tags: z.array(z.string()).optional(),
});

/**
 * 기록 수정 Request (Multipart Form Data의 data 필드)
 *
 * @api PATCH /records/{public_id}
 */
export const UpdateRecordRequestSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().max(500).optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * 기록 삭제 Request (Path Parameter)
 *
 * @api DELETE /records/{public_id}
 */
export const DeleteRecordRequestSchema = z.object({
  publicId: z.string(),
});

/**
 * 연결 그래프 조회 Request (Query Parameters)
 *
 * @api GET /records/{publicId}/graph
 */
export const GetGraphRequestSchema = z.object({
  publicId: z.string(),
  maxNodes: z.number().int().min(1).max(2000).optional().default(2000),
  maxEdges: z.number().int().min(1).max(4000).optional().default(4000),
  maxDepth: z.number().int().min(1).max(50).optional().default(50),
});

/**
 * 연결된 기록 상세 조회 Request (Query Parameters)
 *
 * @api GET /records/{publicId}/graph/records
 */
export const GetConnectedRecordsRequestSchema = z.object({
  publicId: z.string(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ============================================================================
// Response 스키마 (FE 응답 검증용)
// ============================================================================

/**
 * 지도 범위 기반 기록 조회 응답 스키마
 *
 * @api GET /records
 */
export const RecordsByBoundsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    records: z.array(RecordResponseSchema),
    totalCount: z.number(),
  }),
});

/**
 * 전체 기록 조회용 기록 스키마 (좌표 없음, Response용 - camelCase)
 *
 * @api GET /records/all - 응답의 records 배열 아이템
 * 좌표값은 포함하지 않으며, connectionCount 필드를 포함함
 */
export const RecordWithoutCoordsResponseSchema = z.object({
  publicId: z.string(),
  title: z.string(),
  content: z.string().nullable().optional(),
  location: LocationWithoutCoordsSchema,
  tags: z.array(TagDetailResponseSchema),
  images: z.array(ImageResponseSchema).optional(),
  isFavorite: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  connectionCount: z.number(),
});

/**
 * 전체 기록 조회 응답 스키마
 *
 * @api GET /records/all
 */
export const GetAllRecordsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    records: z.array(RecordWithoutCoordsResponseSchema),
    totalCount: z.number(),
  }),
});

/**
 * 기록 삭제 응답 스키마
 *
 * @api DELETE /records/{public_id}
 */
export const DeleteRecordResponseSchema = SuccessResponseSchema;

/**
 * 기록 검색 결과 아이템 스키마 (Response용 - camelCase)
 *
 * @api GET /records/search - 검색 응답의 records 배열 아이템
 */
export const SearchRecordItemResponseSchema = z.object({
  recordId: z.number(),
  title: z.string(),
  tags: z.array(z.string()),
  locationName: z.string(),
  isFavorite: z.boolean(),
  thumbnailImage: z.string().url().optional(),
  date: z.string(),
  connectionCount: z.number(),
  createdAt: z.string().datetime(),
});

/**
 * 기록 검색 응답 스키마
 *
 * @api GET /records/search
 */
export const SearchRecordsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    records: z.array(SearchRecordItemResponseSchema),
    pagination: CursorPaginationResponseSchema,
  }),
});

/**
 * 기록 생성 응답 스키마
 * 실제 API 응답: { status: 'success', data: RecordWithImagesResponseSchema }
 * data 안에 record 객체가 없고, data 자체가 record 객체임
 *
 * @api POST /records
 */
export const CreateRecordResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string().optional(),
  data: RecordWithImagesResponseSchema,
});

/**
 * 기록 수정 응답 스키마
 * 실제 API 응답: { status: 'success', data: RecordWithImagesResponseSchema }
 * data 안에 record 객체가 없고, data 자체가 record 객체임
 *
 * @api PATCH /records/{public_id}
 */
export const UpdateRecordResponseSchema = SuccessResponseSchema.extend({
  data: RecordWithImagesResponseSchema,
});

/**
 * 연결 그래프 노드 스키마 (Response용 - camelCase)
 *
 * @api GET /records/{publicId}/graph - 응답의 nodes 배열 아이템
 */
export const GraphNodeResponseSchema = z.object({
  publicId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

/**
 * 연결 그래프 엣지 스키마 (Response용 - camelCase)
 *
 * @api GET /records/{publicId}/graph - 응답의 edges 배열 아이템
 */
export const GraphEdgeResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
});

/**
 * 연결 그래프 메타 정보 스키마 (Response용 - camelCase)
 *
 * @api GET /records/{publicId}/graph - 응답의 meta 필드
 */
export const GraphMetaResponseSchema = z.object({
  start: z.string(),
  nodeCount: z.number(),
  edgeCount: z.number(),
  truncated: z.boolean(),
  truncatedReason: z.string().optional(),
});

/**
 * 연결 그래프 조회 응답 스키마
 *
 * @api GET /records/{publicId}/graph
 */
export const GraphResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    nodes: z.array(GraphNodeResponseSchema),
    edges: z.array(GraphEdgeResponseSchema),
    meta: GraphMetaResponseSchema,
  }),
});

/**
 * 연결된 기록 상세 조회용 기록 스키마 (Response용 - camelCase)
 *
 * @api GET /records/{publicId}/graph/records - 응답의 records 배열 아이템
 */
export const ConnectedRecordDetailResponseSchema = z.object({
  publicId: z.string(),
  title: z.string(),
  content: z.string(),
  location: LocationSchema,
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * 연결된 기록 상세 조회 응답 스키마
 *
 * @api GET /records/{publicId}/graph/records
 */
export const ConnectedRecordsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    start: z.string(),
    records: z.array(ConnectedRecordDetailResponseSchema),
    page: z.object({
      limit: z.number(),
      nextCursor: z.string().nullable(),
      hasNext: z.boolean(),
    }),
  }),
});


/**
 * 기록 상세 조회 응답 스키마
 * 실제 API 응답: { status: 'success', data: RecordWithImagesResponseSchema }
 * data 안에 record 객체가 없고, data 자체가 record 객체임
 *
 * @api GET /records/{publicId}
 */
export const RecordDetailResponseSchema = SuccessResponseSchema.extend({
  data: RecordWithImagesResponseSchema,
});

// ============================================================================
// 에러 응답 스키마
// ============================================================================

/**
 * 인증 관련 에러 응답 스키마
 */
export const AuthErrorResponseSchema = FailResponseSchema.extend({
  code: z.enum([
    'AUTH_TOKEN_MISSING',
    'AUTH_TOKEN_EXPIRED',
    'AUTH_TOKEN_INVALID',
    'USER_UNAUTHORIZED',
  ]),
});

/**
 * 기록 없음 에러 응답 스키마
 */
export const RecordNotFoundErrorResponseSchema = FailResponseSchema.extend({
  code: z.literal('RECORD_NOT_FOUND'),
});

/**
 * 검증 에러 응답 스키마
 */
export const ValidationErrorResponseSchema = FailResponseSchema.extend({
  code: z.enum([
    'BOUNDS_MISSING',
    'INVALID_LATITUDE',
    'INVALID_LONGITUDE',
    'INVALID_BOUNDS',
    'INVALID_PAGE',
    'INVALID_LIMIT',
    'INVALID_ORDER',
    'TITLE_MISSING',
    'TITLE_TOO_LONG',
    'CONTENT_TOO_LONG',
    'LOCATION_MISSING',
    'LOCATION_NAME_MISSING',
    'LOCATION_ADDRESS_MISSING',
    'TOO_MANY_IMAGES',
    'IMAGE_SIZE_EXCEEDED',
    'INVALID_IMAGE_FORMAT',
    'INVALID_JSON_FORMAT',
    'INVALID_EXISTING_IMAGE',
    'INVALID_CONNECTION',
    'INVALID_PARAMS',
    'INVALID_CURSOR',
  ]),
});

/**
 * 서버 에러 응답 스키마
 */
export const InternalServerErrorResponseSchema = ErrorResponseSchema.extend({
  code: z.enum([
    'INTERNAL_SERVER_ERROR',
    'SERVER_INTERNAL_ERROR',
    'GRAPH_QUERY_FAILED',
  ]),
});
