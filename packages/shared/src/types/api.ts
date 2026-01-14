import { z } from 'zod';
import {
  LocationSchema,
  ImageResponseSchema,
  RecordResponseSchema,
  RecordWithImagesResponseSchema,
  SearchRecordItemResponseSchema,
  GraphNodeResponseSchema,
  GraphEdgeResponseSchema,
  GraphMetaResponseSchema,
  ConnectedRecordDetailResponseSchema,
  GetRecordsByBoundsRequestSchema,
  SearchRecordsRequestSchema,
  CreateRecordRequestSchema,
  UpdateRecordRequestSchema,
  DeleteRecordRequestSchema,
  GetGraphRequestSchema,
  GetConnectedRecordsRequestSchema,
} from '../schemas';

/**
 * Zod 스키마에서 타입 추론 - Response 타입 (camelCase)
 */
export type Location = z.infer<typeof LocationSchema>;
export type Image = z.infer<typeof ImageResponseSchema>;
export type Record = z.infer<typeof RecordResponseSchema>;
export type RecordWithImages = z.infer<typeof RecordWithImagesResponseSchema>;
export type SearchRecordItem = z.infer<typeof SearchRecordItemResponseSchema>;
export type GraphNode = z.infer<typeof GraphNodeResponseSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeResponseSchema>;
export type GraphMeta = z.infer<typeof GraphMetaResponseSchema>;
export type ConnectedRecordDetail = z.infer<
  typeof ConnectedRecordDetailResponseSchema
>;

/**
 * Request 타입 (BE 입력 검증용)
 */
export type GetRecordsByBoundsRequest = z.infer<
  typeof GetRecordsByBoundsRequestSchema
>;
export type SearchRecordsRequest = z.infer<typeof SearchRecordsRequestSchema>;
export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequestSchema>;
export type DeleteRecordRequest = z.infer<typeof DeleteRecordRequestSchema>;
export type GetGraphRequest = z.infer<typeof GetGraphRequestSchema>;
export type GetConnectedRecordsRequest = z.infer<
  typeof GetConnectedRecordsRequestSchema
>;
