import { z } from 'zod';
import {
  LocationSchema,
  LocationWithoutCoordsSchema,
  ImageResponseSchema,
  RecordResponseSchema,
  RecordWithoutCoordsResponseSchema,
  RecordWithImagesResponseSchema,
  SearchRecordItemResponseSchema,
  GraphNodeResponseSchema,
  GraphEdgeResponseSchema,
  GraphMetaResponseSchema,
  ConnectedRecordDetailResponseSchema,
  GraphRecordDetailResponseSchema,
  GraphDetailsResponseSchema,
  GetRecordsByBoundsRequestSchema,
  SearchRecordsRequestSchema,
  GetAllRecordsRequestSchema,
  CreateRecordRequestSchema,
  CreateRecordWithPresignedRequestSchema,
  UpdateRecordRequestSchema,
  DeleteRecordRequestSchema,
  GetGraphRequestSchema,
  GetConnectedRecordsRequestSchema,
} from '../schemas';

/**
 * Zod 스키마에서 타입 추론 - Response 타입 (camelCase)
 */
export type Location = z.infer<typeof LocationSchema>;
export type LocationWithoutCoords = z.infer<typeof LocationWithoutCoordsSchema>;
export type Image = z.infer<typeof ImageResponseSchema>;
export type Record = z.infer<typeof RecordResponseSchema>;
export type RecordWithoutCoords = z.infer<
  typeof RecordWithoutCoordsResponseSchema
>;
export type RecordWithImages = z.infer<typeof RecordWithImagesResponseSchema>;
export type SearchRecordItem = z.infer<typeof SearchRecordItemResponseSchema>;
export type GraphNode = z.infer<typeof GraphNodeResponseSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeResponseSchema>;
export type GraphMeta = z.infer<typeof GraphMetaResponseSchema>;
export type ConnectedRecordDetail = z.infer<
  typeof ConnectedRecordDetailResponseSchema
>;
export type GraphRecordDetail = z.infer<typeof GraphRecordDetailResponseSchema>;
export type GraphDetailsResponse = z.infer<typeof GraphDetailsResponseSchema>;

/**
 * 기록 상세 조회 응답의 record 타입
 * @api GET /records/{publicId} - 응답의 data (data 자체가 record 객체)
 * RecordDetailResponseSchema의 data는 RecordWithImagesResponseSchema와 동일
 */
export type RecordDetail = z.infer<typeof RecordWithImagesResponseSchema>;

/**
 * Request 타입 (BE 입력 검증용)
 */
export type GetRecordsByBoundsRequest = z.infer<
  typeof GetRecordsByBoundsRequestSchema
>;
export type SearchRecordsRequest = z.infer<typeof SearchRecordsRequestSchema>;
export type GetAllRecordsRequest = z.infer<typeof GetAllRecordsRequestSchema>;
export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
export type CreateRecordWithPresignedRequest = z.infer<
  typeof CreateRecordWithPresignedRequestSchema
>;
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequestSchema>;
export type DeleteRecordRequest = z.infer<typeof DeleteRecordRequestSchema>;
export type GetGraphRequest = z.infer<typeof GetGraphRequestSchema>;
export type GetConnectedRecordsRequest = z.infer<
  typeof GetConnectedRecordsRequestSchema
>;
