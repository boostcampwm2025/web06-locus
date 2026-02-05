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
