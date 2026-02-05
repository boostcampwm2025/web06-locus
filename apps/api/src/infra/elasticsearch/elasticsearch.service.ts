import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { IndexConfig } from './types/elasticsearch.types';
import { ESDocumentNotFoundException } from './exceptions/elasticsearch.exception';
import {
  MappingTypeMapping,
  ReindexRequest,
  SearchRequest,
  SearchResponse,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';

@Injectable()
export class ElasticsearchService {
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor(
    private readonly elasticsearchService: NestElasticsearchService,
  ) {}

  async initializeIndex(config: IndexConfig): Promise<void> {
    try {
      const aliasExists = await this.aliasExists(config.aliasName);

      if (!aliasExists) {
        // 최초 생성 또는 레거시 인덱스가 있는 경우
        await this.handleInitialSetup(config);
      } else {
        // 버전 체크
        await this.handleVersionCheck(config);
      }
    } catch (error) {
      this.logger.error('❌ 인덱스 초기화 실패', error);
      throw error;
    }
  }

  async syncMapping(
    indexName: string,
    definedMapping: MappingTypeMapping,
  ): Promise<string[]> {
    const currentProperties = await this.getMapping(indexName);
    const definedProperties = definedMapping.properties ?? {};

    const missingFields = this.findMissingFields(
      currentProperties,
      definedProperties,
    );

    if (missingFields.length === 0) return [];

    const newProperties = missingFields.reduce(
      (acc, fieldName) => {
        acc[fieldName] = definedProperties[fieldName];
        return acc;
      },
      {} as Record<string, any>,
    );

    await this.addFieldsToMapping(indexName, newProperties);

    return missingFields;
  }

  async indexExists(indexName: string): Promise<boolean> {
    return this.elasticsearchService.indices.exists({ index: indexName });
  }

  async countDocumentsMissingField(
    indexName: string,
    fieldName: string,
  ): Promise<number> {
    try {
      const { hits } = await this.elasticsearchService.search({
        index: indexName,
        size: 0,
        query: { bool: { must_not: { exists: { field: fieldName } } } },
      });

      return typeof hits.total === 'number'
        ? hits.total
        : (hits.total?.value ?? 0);
    } catch (error) {
      this.logger.error(`❌ 필드 누락 문서 수 조회 실패: ${fieldName}`, error);
      return 0;
    }
  }

  async getDocumentIdsMissingField(
    indexName: string,
    fieldName: string,
    size = 100,
  ): Promise<string[]> {
    try {
      const { hits } = await this.elasticsearchService.search({
        index: indexName,
        size,
        query: { bool: { must_not: { exists: { field: fieldName } } } },
        _source: false,
      });

      return hits.hits
        .map((hit) => hit._id)
        .filter((id): id is string => id !== undefined);
    } catch (error) {
      this.logger.error(`❌ 문서 ID 조회 실패: ${fieldName}`, error);
      return [];
    }
  }

  async bulkUpdate(
    indexName: string,
    updates: { id: string; doc: Record<string, any> }[],
  ): Promise<void> {
    if (updates.length === 0) return;

    const operations = updates.flatMap((update) => [
      { update: { _index: indexName, _id: update.id } },
      { doc: update.doc },
    ]);

    try {
      const response = await this.elasticsearchService.bulk({
        operations,
        refresh: false,
      });

      if (response.errors) {
        const erroredDocs = response.items.filter((item) => item.update?.error);
        // NOTE: 이건 또 재시도 어떻게 하지.. 일단 백로그로 넣기
        this.logger.warn(
          `⚠️  일부 문서 업데이트 실패: ${erroredDocs.length}개`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Bulk 업데이트 실패`, error);
      throw error;
    }
  }

  async deleteIndex(indexName: string): Promise<void> {
    try {
      const exists = await this.indexExists(indexName);
      if (!exists) {
        this.logger.warn(`⚠️  삭제할 인덱스 없음: ${indexName}`);
        return;
      }
      await this.elasticsearchService.indices.delete({ index: indexName });
      this.logger.log(`✅ 인덱스 삭제 완료: ${indexName}`);
    } catch (error) {
      this.logger.error(`❌ 인덱스 삭제 실패: ${indexName}`, error);
      throw error;
    }
  }

  async indexDocument<T>(
    index: string,
    id: string,
    document: T,
  ): Promise<void> {
    await this.elasticsearchService.index({ index, id, document });
  }

  async updateDocument<T>(
    index: string,
    id: string,
    doc: Partial<T>,
  ): Promise<void> {
    try {
      await this.elasticsearchService.update({ index, id, doc });
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        throw new ESDocumentNotFoundException(index);
      }
      throw error;
    }
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({ index, id });
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        this.logger.warn(`⚠️  문서 이미 삭제됨: ${id}`);
        return;
      }
      throw error;
    }
  }

  async search<T>(params: SearchRequest): Promise<SearchResponse<T>> {
    return this.elasticsearchService.search<T>(params);
  }

  private async createIndex(config: IndexConfig): Promise<void> {
    try {
      await this.elasticsearchService.indices.create({
        index: config.indexName,
        settings: config.settings,
        mappings: config.mapping,
      });
      this.logger.log(`✅ 인덱스 생성 완료: ${config.indexName}`);
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 400) {
        this.logger.warn(`⚠️  인덱스 이미 존재: ${config.indexName}`);
        return;
      }
      this.logger.error('❌ 인덱스 생성 실패', error);
      throw error;
    }
  }

  private async createAlias(
    indexName: string,
    aliasName: string,
  ): Promise<void> {
    try {
      await this.elasticsearchService.indices.updateAliases({
        actions: [{ add: { index: indexName, alias: aliasName } }],
      });
      this.logger.log(`✅ Alias 생성: ${aliasName} → ${indexName}`);
    } catch (error) {
      this.logger.error(`❌ Alias 생성 실패: ${aliasName}`, error);
      throw error;
    }
  }

  private async getIndexByAlias(aliasName: string): Promise<string | null> {
    try {
      const aliases = await this.elasticsearchService.indices.getAlias({
        name: aliasName,
      });
      const indexNames = Object.keys(aliases);
      return indexNames.length > 0 ? indexNames[0] : null;
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  private async aliasExists(aliasName: string): Promise<boolean> {
    return this.elasticsearchService.indices.existsAlias({ name: aliasName });
  }

  private async handleInitialSetup(config: IndexConfig): Promise<void> {
    const legacyIndexExists = await this.indexExists(config.aliasName);

    if (legacyIndexExists) {
      // 레거시 인덱스를 버전 인덱스로 마이그레이션
      this.logger.warn(
        `⚠️ 레거시 인덱스 '${config.aliasName}' '${config.indexName}'로 마이그레이션`,
      );
      await this.migrateLegacyToVersioned(config);
    } else {
      await this.createNewVersionedIndex(config);
    }
  }

  private async migrateLegacyToVersioned(config: IndexConfig): Promise<void> {
    try {
      // 새 버전 인덱스 생성
      await this.createIndex(config);
      await this.reindex(config.aliasName, config.indexName, config.mapping);
      await this.deleteIndex(config.aliasName);
      await this.createAlias(config.indexName, config.aliasName);

      this.logger.log('✅ 레거시 마이그레이션 완료');
    } catch (error) {
      this.logger.error('❌ 레거시 마이그레이션 실패', error);
      throw error;
    }
  }

  private async createNewVersionedIndex(config: IndexConfig): Promise<void> {
    await this.createIndex(config);
    await this.createAlias(config.indexName, config.aliasName);
    this.logger.log(`✅ 새 인덱스 생성 완료: ${config.indexName}`);
  }

  // 버전 체크
  private async handleVersionCheck(config: IndexConfig): Promise<void> {
    const indexName = await this.getIndexByAlias(config.aliasName);

    if (!indexName) {
      this.logger.error('❌ Alias에 연결된 인덱스가 없습니다');
      return;
    }

    if (indexName !== config.indexName) {
      await this.indexToNewVersion(indexName, config);
      return;
    }

    this.logger.log(`✅ 현재 인덱스 버전: v${config.version}`);
  }

  private async indexToNewVersion(
    oldIndexName: string,
    config: IndexConfig,
  ): Promise<void> {
    try {
      // 새 버전 인덱스 생성
      const newIndexExists = await this.indexExists(config.indexName);
      if (!newIndexExists) {
        await this.createIndex(config);
      }
      await this.reindex(oldIndexName, config.indexName, config.mapping);
      await this.updateAlias(config.aliasName, oldIndexName, config.indexName);
      await this.deleteIndex(oldIndexName);

      this.logger.log('✅ 재인덱싱 완료');
    } catch (error) {
      this.logger.error('❌ 재인덱싱 실패', error);
      throw error;
    }
  }

  private async getMapping(indexName: string): Promise<Record<string, any>> {
    try {
      const mapping = await this.elasticsearchService.indices.getMapping({
        index: indexName,
      });
      return mapping[indexName]?.mappings?.properties ?? {};
    } catch (error) {
      this.logger.error(`❌ 매핑 조회 실패: ${indexName}`, error);
      throw error;
    }
  }

  private findMissingFields(
    currentProperties: Record<string, any>,
    definedProperties: Record<string, any>,
  ): string[] {
    return Object.keys(definedProperties).filter(
      (fieldName) => !currentProperties[fieldName],
    );
  }

  private async addFieldsToMapping(
    indexName: string,
    newProperties: Record<string, any>,
  ): Promise<void> {
    try {
      await this.elasticsearchService.indices.putMapping({
        index: indexName,
        properties: newProperties,
      });
      this.logger.log(
        `✅ 새로운 필드 매핑 업데이트 완료: ${Object.keys(newProperties).join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`❌ 매핑 업데이트 실패: ${indexName}`, error);
      throw error;
    }
  }

  /**
   * @see https://www.elastic.co/guide/en/elasticsearch/reference/8.19/docs-reindex.html
   */
  private async reindex(
    sourceIndex: string,
    destIndex: string,
    destMapping?: MappingTypeMapping,
  ): Promise<void> {
    try {
      const reindexBody: ReindexRequest = {
        source: { index: sourceIndex },
        dest: { index: destIndex },
        wait_for_completion: false,
      };

      // 매핑이 제공되면 해당 필드만 복사하도록
      if (destMapping?.properties) {
        const allowedFields = Object.keys(destMapping.properties);

        reindexBody.script = {
          source: `
            def newDoc = [:];
            for (field in params.fields) {
                if (ctx._source.containsKey(field)) {
                    newDoc[field] = ctx._source[field];
                }
            }
            ctx._source = newDoc;
          `,
          lang: 'painless',
          params: { fields: allowedFields },
        };
      }
      await this.elasticsearchService.reindex(reindexBody);
    } catch (error) {
      this.logger.error(`❌ 재인덱싱 시작 실패`, error);
      throw error;
    }
  }

  private async updateAlias(
    aliasName: string,
    oldIndexName: string,
    newIndexName: string,
  ): Promise<void> {
    try {
      await this.elasticsearchService.indices.updateAliases({
        actions: [
          { remove: { index: oldIndexName, alias: aliasName } },
          { add: { index: newIndexName, alias: aliasName } },
        ],
      });
      this.logger.log(
        `✅ ES Alias 전환 완료: ${aliasName} (${oldIndexName} → ${newIndexName})`,
      );
    } catch (error) {
      this.logger.error(`❌ Alias 전환 실패`, error);
      throw error;
    }
  }
}
