import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ElasticsearchService } from '@/infra/elasticsearch/elasticsearch.service';
import { RecordSyncPayload } from '../type/record-sync.types';
import { VersionedWriteResult } from '@/infra/elasticsearch/types/elasticsearch.types';
import {
  RECORD_INDEX_ALIAS,
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_INDEX_VERSION,
  RECORD_SEARCH_COMPUTED_FIELDS,
  RECORD_SEARCH_FIELDS,
  RECORD_SEARCH_MAPPING,
  RECORD_SEARCH_SORT_CRITERIA,
} from '../constants/record-search.constant';
import { SearchRecordsDto } from '../dto/search-records.dto';
import {
  FieldValue,
  QueryDslQueryContainer,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { Record as PrismaRecord } from '@prisma/client';

@Injectable()
export class RecordSearchService {
  private readonly logger = new Logger(RecordSearchService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    await this.ensureIndexExists();
  }

  /**
   * 기록 스냅샷을 ES에 덮어쓴다.
   * - version(outbox id)이 현재 문서보다 클 때만 반영(external version)
   * - 중복·지연 이벤트는 STALE로 돌려주며, 호출 측은 정상 처리(ACK)로 다룬다
   */
  async upsertRecord(
    payload: RecordSyncPayload,
    version: number,
  ): Promise<VersionedWriteResult> {
    return this.elasticsearchService.indexDocument(
      RECORD_INDEX_ALIAS,
      String(payload.recordId),
      payload,
      version,
    );
  }

  async search(userId: bigint, dto: SearchRecordsDto) {
    const { cursor, size = 20 } = dto;

    const searchAfter = cursor
      ? (JSON.parse(
          Buffer.from(cursor, 'base64').toString('utf8'),
        ) as FieldValue[])
      : undefined;

    const result = await this.elasticsearchService.search<RecordSyncPayload>({
      index: RECORD_INDEX_ALIAS,
      size: size,
      query: this.buildSearchQuery(userId, dto),
      sort: RECORD_SEARCH_SORT_CRITERIA,
      search_after: searchAfter,
    });

    return result;
  }

  /**
   * 기록 문서를 삭제하고 삭제 버전을 남긴다.
   * - 이후 도착하는 더 낮은 버전의 이벤트가 문서를 되살리지 못한다.
   */
  async deleteRecord(
    recordId: string,
    version: number,
  ): Promise<VersionedWriteResult> {
    return this.elasticsearchService.deleteDocument(
      RECORD_INDEX_ALIAS,
      recordId,
      version,
    );
  }

  private async ensureIndexExists() {
    const exists =
      await this.elasticsearchService.indexExists(RECORD_INDEX_NAME);

    if (!exists) {
      await this.elasticsearchService.initializeIndex({
        indexName: RECORD_INDEX_NAME,
        aliasName: RECORD_INDEX_ALIAS,
        version: RECORD_INDEX_VERSION,
        settings: RECORD_INDEX_SETTINGS,
        mapping: RECORD_SEARCH_MAPPING,
      });
      return;
    }

    await this.handleMappingChanges();
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

  private async handleMappingChanges() {
    try {
      const newFields = await this.elasticsearchService.syncMapping(
        RECORD_INDEX_NAME,
        RECORD_SEARCH_MAPPING,
      );
      if (newFields.length > 0) await this.backfillFromDB(newFields);
    } catch (error) {
      this.logger.error('❌ 매핑 변경사항 처리 실패', error);
    }
  }

  // TODO: 코드 개선필요.
  private async backfillFromDB(newFields: string[]): Promise<void> {
    const BATCH_SIZE = 100;

    // DB 필드만 필터링
    const dbFields = newFields.filter((field) => !this.isComputedField(field));

    if (dbFields.length === 0) return;

    for (const field of dbFields) {
      try {
        // 해당 필드가 없는 문서 수 확인
        const missingCount =
          await this.elasticsearchService.countDocumentsMissingField(
            RECORD_INDEX_ALIAS,
            field,
          );

        if (missingCount === 0) continue;

        while (true) {
          // 필드가 없는 문서 ID 조회
          const docIds =
            await this.elasticsearchService.getDocumentIdsMissingField(
              RECORD_INDEX_ALIAS,
              field,
              BATCH_SIZE,
            );

          if (docIds.length === 0) break;

          // DB에서 데이터 조회
          const recordIds = docIds.map((id) => BigInt(id));
          const records = await this.getRecordsForBackfill(recordIds, field);

          // Elasticsearch 업데이트
          const updates = records.map((record) => ({
            id: String(record.id),
            doc: this.extractFieldValue(record, field),
          }));

          await this.elasticsearchService.bulkUpdate(
            RECORD_INDEX_ALIAS,
            updates,
          );
        }
      } catch (error) {
        this.logger.error(`❌ ${field} 백필 실패`, error);
      }
    }
  }

  private isComputedField(fieldName: string): boolean {
    return RECORD_SEARCH_COMPUTED_FIELDS.includes(fieldName);
  }

  private async getRecordsForBackfill(
    recordIds: bigint[],
    field: string,
  ): Promise<Partial<PrismaRecord>[]> {
    const selectFields = this.getSelectFieldsForBackfill(field);

    return await this.prisma.record.findMany({
      where: { id: { in: recordIds } },
      select: selectFields,
    });
  }

  private getSelectFieldsForBackfill(field: string): Record<string, boolean> {
    const fieldSelectMap: Record<string, Record<string, boolean>> = {
      title: { id: true, title: true },
      content: { id: true, content: true },
      isFavorite: { id: true, isFavorite: true },
      locationName: { id: true, locationName: true },
      locationAddress: { id: true, locationAddress: true },
      connectionsCount: { id: true, connectionsCount: true },
      createdAt: { id: true, createdAt: true },
      updatedAt: { id: true, updatedAt: true },
    };

    return fieldSelectMap[field] ?? { id: true, [field]: true };
  }

  private extractFieldValue(
    record: Partial<PrismaRecord>,
    field: string,
  ): Record<string, any> {
    const value = record[field as keyof PrismaRecord];
    return { [field]: value };
  }
}
