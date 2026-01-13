import { z } from 'zod';
import {
  LocationSchema,
  ImageSchema,
  RecordSchema,
  RecordWithImagesSchema,
  SearchRecordItemSchema,
  GraphNodeSchema,
  GraphEdgeSchema,
  GraphMetaSchema,
  ConnectedRecordDetailSchema,
  GetRecordsByBoundsRequestSchema,
  SearchRecordsRequestSchema,
  CreateRecordRequestSchema,
  UpdateRecordRequestSchema,
  DeleteRecordRequestSchema,
  GetGraphRequestSchema,
  GetConnectedRecordsRequestSchema,
} from '../schemas';

/**
 * Zod 스키마에서 타입 추론 - 공통 타입
 */
export type Location = z.infer<typeof LocationSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Record = z.infer<typeof RecordSchema>;
export type RecordWithImages = z.infer<typeof RecordWithImagesSchema>;
export type SearchRecordItem = z.infer<typeof SearchRecordItemSchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type GraphMeta = z.infer<typeof GraphMetaSchema>;
export type ConnectedRecordDetail = z.infer<typeof ConnectedRecordDetailSchema>;

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
