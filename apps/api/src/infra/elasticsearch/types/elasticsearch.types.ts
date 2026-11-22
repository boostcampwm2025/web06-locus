import {
  IndicesIndexSettings,
  MappingTypeMapping,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';

export interface IndexConfig {
  indexName: string;
  aliasName: string;
  version: number;
  settings: IndicesIndexSettings;
  mapping: MappingTypeMapping;
}

/**
 * external version 쓰기 결과
 * - APPLIED: 쓰기가 반영됨
 * - STALE: 이미 같거나 더 높은 버전이 반영돼 있어 무시됨(중복·지연 이벤트)
 */
export type VersionedWriteResult = 'APPLIED' | 'STALE';
