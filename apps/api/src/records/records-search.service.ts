import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { RecordSyncPayload } from './type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_MAPPING,
} from './constants/record-search.constant';
import { ESDocumentNotFoundException } from './exceptions/record.exceptions';

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

  async updateRecord(payload: RecordSyncPayload) {
    try {
      await this.elasticsearchService.update({
        index: RECORD_INDEX_NAME,
        id: String(payload.recordId),
        doc: payload,
      });

      this.logger.log(`✅ Record ${payload.recordId} 업데이트 완료`);
    } catch (error) {
      this.logger.error(`❌ Record ${payload.recordId} 업데이트 실패`, error);
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        throw new ESDocumentNotFoundException(payload.recordId);
      }
      throw error;
    }
  }

  async deleteRecord(recordId: string) {
    try {
      await this.elasticsearchService.delete({
        index: RECORD_INDEX_NAME,
        id: recordId,
      });

      this.logger.log(`✅ Record ${recordId} 삭제 완료`);
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        this.logger.warn(`⚠️  Record ${recordId} 이미 삭제됨 (ES)`);
        return;
      }
      this.logger.error(`❌ Record ${recordId} 삭제 실패`, error);
      throw error;
    }
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
}
