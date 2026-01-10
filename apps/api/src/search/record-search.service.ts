import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

interface RecordDocument {
  title: string;
  content: string;
}

export interface SearchResponse {
  keyword: string;
  total: number | { value: number };
  results: {
    id: string;
    score: number;
    title: string;
    content: string;
  }[];
}

@Injectable()
export class RecordSearchService {
  private readonly logger = new Logger(RecordSearchService.name);

  // NOTE: 테스트용 인덱스 이름 (수정 필요!)
  private readonly indexName = 'records_test';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async save(record: RecordDocument) {
    return this.elasticsearchService.index({
      index: this.indexName,
      document: record,
      refresh: 'true',
    });
  }

  async search(keyword: string): Promise<SearchResponse> {
    const result = await this.elasticsearchService.search<RecordDocument>({
      index: this.indexName,
      query: {
        match: {
          title: keyword,
        },
      },
    });

    return {
      keyword,
      total: result.hits.total ?? { value: 0 },
      results: result.hits.hits.map((hit) => ({
        id: hit._id ?? '',
        score: hit._score ?? 0,
        title: hit._source?.title ?? '',
        content: hit._source?.content ?? '',
      })),
    };
  }
}
