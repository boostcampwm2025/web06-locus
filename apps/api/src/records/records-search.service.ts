import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecordSyncPayload } from './type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_MAPPING,
} from './constants/record-search.constant';

@Injectable()
export class RecordSearchService {
  private readonly logger = new Logger(RecordSearchService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    await this.ensureIndexExists();
  }

  async indexRecord(payload: RecordSyncPayload) {
    await this.elasticsearchService.index({
      index: RECORD_INDEX_NAME,
      id: String(payload.recordId),
      document: payload,
    });
  }

  /**
   * Elasticsearch 인덱스 생성 (없으면)
   * - Nori 형태소 분석기 설정 (한글 검색)
   * - 필드 매핑 정의
   */
  private async ensureIndexExists() {
    try {
      const exists = await this.elasticsearchService.indices.exists({
        index: RECORD_INDEX_NAME,
      });

      if (!exists) {
        await this.elasticsearchService.indices.create({
          index: RECORD_INDEX_NAME,
          settings: RECORD_INDEX_SETTINGS,
          mappings: RECORD_SEARCH_MAPPING,
        });
        this.logger.log('✅ Elasticsearch index 생성');
      }
    } catch (error) {
      this.logger.error('❌ Elasticsearch index 생성 실패', error);
      throw error;
    }
  }
}
