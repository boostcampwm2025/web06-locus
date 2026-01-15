import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecordSyncPayload } from './type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_MAPPING,
} from '../records/constants/record-search.constant';

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

  async updateRecord(payload: RecordSyncPayload) {
    try {
      await this.elasticsearchService.update({
        index: RECORD_INDEX_NAME,
        id: String(payload.recordId),
        doc: payload,
        doc_as_upsert: true, // 문서가 없으면 생성 (혹시 모를 문제를 예방)
      });

      this.logger.log(`✅ Record ${payload.recordId} 업데이트 완료`);
    } catch (error) {
      this.logger.error(`❌ Record ${payload.recordId} 업데이트 실패`, error);
      throw error;
    }
  }
}
