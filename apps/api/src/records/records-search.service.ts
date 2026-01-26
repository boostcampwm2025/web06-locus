import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { RecordSyncPayload } from './type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_FIELDS,
  RECORD_SEARCH_MAPPING,
  RECORD_SEARCH_SORT_CRITERIA,
} from './constants/record-search.constant';
import { ESDocumentNotFoundException } from './exceptions/record.exceptions';
import { SearchRecordsDto } from './dto/search-records.dto';
import {
  FieldValue,
  QueryDslQueryContainer,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';

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

  async search(userId: bigint, dto: SearchRecordsDto) {
    const { cursor, size = 20 } = dto;

    const searchAfter = cursor
      ? (JSON.parse(
          Buffer.from(cursor, 'base64').toString('utf8'),
        ) as FieldValue[])
      : undefined;

    const result = await this.elasticsearchService.search<RecordSyncPayload>({
      index: RECORD_INDEX_NAME,
      size: size,
      query: this.buildSearchQuery(userId, dto),
      sort: RECORD_SEARCH_SORT_CRITERIA,
      search_after: searchAfter,
    });

    return result;
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

  /**
   * 검색 조건에 따른 Elasticsearch Query DSL 생성
   */
  private buildSearchQuery(
    userId: bigint,
    dto: SearchRecordsDto,
  ): QueryDslQueryContainer {
    const { keyword, tags, hasImage, isFavorite } = dto;

    const filters: QueryDslQueryContainer[] = [
      { term: { userId: userId.toString() } },
    ];

    if (tags?.length) filters.push({ terms: { tags } });
    if (hasImage) filters.push({ term: { hasImages: true } });
    if (isFavorite) filters.push({ term: { isFavorite: true } });

    return {
      bool: {
        must: [
          {
            multi_match: {
              query: keyword,
              fields: RECORD_SEARCH_FIELDS,
              type: 'best_fields',
            },
          },
        ],
        filter: filters,
      },
    };
  }
}
