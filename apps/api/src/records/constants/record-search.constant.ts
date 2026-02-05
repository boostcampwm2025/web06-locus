import {
  MappingTypeMapping,
  IndicesIndexSettings,
  Sort,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';

export const RECORD_INDEX_VERSION = 2; // 인덱스 내용 변경 시 버전 증가(필드 추가시에는 버전 증가 X)
export const RECORD_INDEX_NAME = `records_v${RECORD_INDEX_VERSION}`;
export const RECORD_INDEX_ALIAS = 'records'; // 사용할 alias

export const RECORD_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    analyzer: {
      nori_analyzer: {
        type: 'custom',
        tokenizer: 'nori_tokenizer',
        filter: ['lowercase', 'nori_part_of_speech'],
      },
    },
  },
} satisfies IndicesIndexSettings;

export const RECORD_SEARCH_MAPPING: MappingTypeMapping = {
  properties: {
    recordId: { type: 'long' },
    publicId: { type: 'keyword' },
    userId: { type: 'long' },
    title: {
      type: 'text',
      analyzer: 'nori_analyzer',
      fields: { keyword: { type: 'keyword' } },
    },
    content: { type: 'text', analyzer: 'nori_analyzer' },
    isFavorite: { type: 'boolean' },
    locationName: { type: 'text', analyzer: 'nori_analyzer' },
    tags: { type: 'keyword' },
    hasImages: { type: 'boolean' },
    thumbnailImage: { type: 'keyword' },
    connectionsCount: { type: 'integer' },
    createdAt: { type: 'date' },
  },
};

export const RECORD_SEARCH_FIELDS = [
  'title^10',
  'tags^5',
  'locationName^3',
  'content^2',
];

export const RECORD_SEARCH_SORT_CRITERIA: Sort = [
  { isFavorite: 'desc' },
  { _score: { order: 'desc' } },
  { recordId: 'desc' },
];

export const RECORD_SEARCH_COMPUTED_FIELDS: string[] = [
  'hasImages',
  'thumbnailImage',
  'tags',
] as const;
