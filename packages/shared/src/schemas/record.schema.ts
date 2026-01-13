import { z } from 'zod';
import {
  LocationSchema,
  ImageSchema,
  SuccessResponseSchema,
  FailResponseSchema,
  ErrorResponseSchema,
  CursorPaginationSchema,
} from './common.schema';

// ============================================================================
// 공통 스키마
// ============================================================================

/**
 * 기본 기록 스키마
 * connections 필드는 GET /records/{publicId}/graph와 GET /records/{publicId}/graph/records에서만 관리됨
 *
 * @api GET /records - 지도 범위 기반 기록 조회 응답에 사용
 */
export const RecordSchema = z.object({
  public_id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  location: LocationSchema,
  tags: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * 기록 생성/수정 응답용 기록 스키마 (이미지 포함)
 *
 * @api POST /records - 기록 생성 응답에 사용
 * @api PATCH /records/{public_id} - 기록 수정 응답에 사용
 */
export const RecordWithImagesSchema = RecordSchema.extend({
  user_id: z.string().optional(),
  images: z.array(ImageSchema),
  is_favorite: z.boolean(),
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
  ne_lat: z.number().min(-90).max(90),
  ne_lng: z.number().min(-180).max(180),
  sw_lat: z.number().min(-90).max(90),
  sw_lng: z.number().min(-180).max(180),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(10).max(100).optional().default(10),
  sort_order: z.enum(['desc', 'asc']).optional().default('desc'),
});

/**
 * 기록 검색 Request (Query Parameters)
 *
 * @api GET /records/search
 */
export const SearchRecordsRequestSchema = z.object({
  keyword: z.string().min(1),
  tags: z.array(z.string()).optional(),
  sort_order: z.enum(['desc', 'asc']).optional(),
  has_image: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  cursor: z.string().optional(),
  size: z.number().int().min(1).optional(),
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
  connections: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
});

/**
 * 기록 삭제 Request (Path Parameter)
 *
 * @api DELETE /records/{public_id}
 */
export const DeleteRecordRequestSchema = z.object({
  public_id: z.string(),
});

/**
 * 연결 그래프 조회 Request (Query Parameters)
 *
 * @api GET /records/{publicId}/graph
 */
export const GetGraphRequestSchema = z.object({
  publicId: z.string(),
  max_nodes: z.number().int().min(1).max(2000).optional().default(2000),
  max_edges: z.number().int().min(1).max(4000).optional().default(4000),
  max_depth: z.number().int().min(1).max(50).optional().default(50),
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
    records: z.array(RecordSchema),
    total_count: z.number(),
  }),
});

/**
 * 기록 삭제 응답 스키마
 *
 * @api DELETE /records/{public_id}
 */
export const DeleteRecordResponseSchema = SuccessResponseSchema;

/**
 * 기록 검색 결과 아이템 스키마
 *
 * @api GET /records/search - 검색 응답의 records 배열 아이템
 */
export const SearchRecordItemSchema = z.object({
  record_id: z.number(),
  title: z.string(),
  tags: z.array(z.string()),
  location_name: z.string(),
  is_favorite: z.boolean(),
  thumbnail_image: z.string().url().optional(),
  date: z.string(),
  connectionCount: z.number(),
  created_at: z.string().datetime(),
});

/**
 * 기록 검색 응답 스키마
 *
 * @api GET /records/search
 */
export const SearchRecordsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    records: z.array(SearchRecordItemSchema),
    pagination: CursorPaginationSchema,
  }),
});

/**
 * 기록 생성 응답 스키마
 *
 * @api POST /records
 */
export const CreateRecordResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    record: RecordWithImagesSchema,
  }),
});

/**
 * 기록 수정 응답 스키마
 *
 * @api PATCH /records/{public_id}
 */
export const UpdateRecordResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    record: RecordWithImagesSchema,
  }),
});

/**
 * 연결 그래프 노드 스키마
 *
 * @api GET /records/{publicId}/graph - 응답의 nodes 배열 아이템
 */
export const GraphNodeSchema = z.object({
  public_id: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

/**
 * 연결 그래프 엣지 스키마
 *
 * @api GET /records/{publicId}/graph - 응답의 edges 배열 아이템
 */
export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

/**
 * 연결 그래프 메타 정보 스키마
 *
 * @api GET /records/{publicId}/graph - 응답의 meta 필드
 */
export const GraphMetaSchema = z.object({
  start: z.string(),
  node_count: z.number(),
  edge_count: z.number(),
  truncated: z.boolean(),
  truncated_reason: z.string().optional(),
});

/**
 * 연결 그래프 조회 응답 스키마
 *
 * @api GET /records/{publicId}/graph
 */
export const GraphResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
    meta: GraphMetaSchema,
  }),
});

/**
 * 연결된 기록 상세 조회용 기록 스키마
 *
 * @api GET /records/{publicId}/graph/records - 응답의 records 배열 아이템
 */
export const ConnectedRecordDetailSchema = z.object({
  public_id: z.string(),
  title: z.string(),
  content: z.string(),
  location: LocationSchema,
  tags: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * 연결된 기록 상세 조회 응답 스키마
 *
 * @api GET /records/{publicId}/graph/records
 */
export const ConnectedRecordsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    start: z.string(),
    records: z.array(ConnectedRecordDetailSchema),
    page: z.object({
      limit: z.number(),
      next_cursor: z.string().nullable(),
      has_next: z.boolean(),
    }),
  }),
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
