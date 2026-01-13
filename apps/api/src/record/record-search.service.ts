import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecordSyncPayload } from './type/record-sync.types';

@Injectable()
export class RecordSearchService {
  private readonly logger = new Logger(RecordSearchService.name);
  private readonly INDEX_NAME = 'records';

  constructor(private readonly esService: ElasticsearchService) {}

  async onModuleInit() {
    await this.ensureIndexExists();
  }

  /**
   * Elasticsearch 인덱스 생성 (없으면)
   * - Nori 형태소 분석기 설정 (한글 검색)
   * - 필드 매핑 정의
   */
  private async ensureIndexExists() {
    try {
      const exists = await this.esService.indices.exists({
        index: this.INDEX_NAME,
      });

      if (!exists) {
        await this.esService.indices.create({
          index: this.INDEX_NAME,
          settings: {
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
          },
          mappings: {
            properties: {
              record_id: { type: 'long' },
              public_id: { type: 'keyword' },
              user_id: { type: 'long' },
              title: {
                type: 'text',
                analyzer: 'nori_analyzer',
                fields: { keyword: { type: 'keyword' } },
              },
              content: { type: 'text', analyzer: 'nori_analyzer' },
              is_favorite: { type: 'boolean' },
              location_name: { type: 'text', analyzer: 'nori_analyzer' },
              tags: { type: 'keyword' },
              has_images: { type: 'boolean' },
              thumbnail_image: { type: 'keyword' },
              connections_count: { type: 'integer' },
              date: { type: 'date' },
              created_at: { type: 'date' },
            },
          },
        });

        this.logger.log('✅ Elasticsearch index 생성');
      }
    } catch (error) {
      this.logger.error('❌ Elasticsearch index 생성 실패', error);
      throw error;
    }
  }

  async indexRecord(payload: RecordSyncPayload) {
    await this.esService.index({
      index: this.INDEX_NAME,
      id: String(payload.recordId),
      document: payload,
    });
  }
}
