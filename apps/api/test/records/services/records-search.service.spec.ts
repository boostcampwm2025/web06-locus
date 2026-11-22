import { Test, TestingModule } from '@nestjs/testing';
import { RecordSearchService } from '../../../src/records/services/records-search.service';
import { RecordSyncPayload } from '../../../src/records/type/record-sync.types';
import {
  RECORD_INDEX_ALIAS,
  RECORD_INDEX_NAME,
} from '../../../src/records/constants/record-search.constant';
import { SearchRecordsDto } from '@/records/dto/search-records.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ElasticsearchService } from '@/infra/elasticsearch/elasticsearch.service';

describe('RecordSearchService', () => {
  let service: RecordSearchService;

  const mockPrismaService = {
    record: {
      findMany: jest.fn(),
    },
  };

  const mockElasticsearchService = {
    indexDocument: jest.fn(),
    deleteDocument: jest.fn(),
    search: jest.fn(),
    indexExists: jest.fn(),
    initializeIndex: jest.fn(),
    syncMapping: jest.fn(),
    countDocumentsMissingField: jest.fn(),
    getDocumentIdsMissingField: jest.fn(),
    bulkUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordSearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<RecordSearchService>(RecordSearchService);
  });

  describe('onModuleInit', () => {
    test('인덱스가 존재하지 않으면 새로 생성해야 한다', async () => {
      // given
      mockElasticsearchService.indexExists.mockResolvedValue(false);
      mockElasticsearchService.initializeIndex.mockResolvedValue({} as any);

      // when
      await service.onModuleInit();

      // then
      expect(mockElasticsearchService.indexExists).toHaveBeenCalledWith(
        RECORD_INDEX_NAME,
      );
      expect(mockElasticsearchService.initializeIndex).toHaveBeenCalled();
      // expect(mockElasticsearchService.initializeIndex).toHaveBeenCalledWith({
      //   index: RECORD_INDEX_NAME,
      //   settings: RECORD_INDEX_SETTINGS,
      //   mappings: RECORD_SEARCH_MAPPING,
      // });
    });

    test('인덱스가 이미 존재하면 생성하지 않아야 한다', async () => {
      // given
      mockElasticsearchService.indexExists.mockResolvedValue(true);

      // when
      await service.onModuleInit();

      // then
      expect(mockElasticsearchService.indexExists).toHaveBeenCalledWith(
        RECORD_INDEX_NAME,
      );
      expect(mockElasticsearchService.initializeIndex).not.toHaveBeenCalled();
    });

    test('인덱스 생성 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const error = new Error('Index 생성 실패');
      mockElasticsearchService.indexExists.mockResolvedValue(false);
      mockElasticsearchService.initializeIndex.mockRejectedValue(error);

      // when & then
      await expect(service.onModuleInit()).rejects.toThrow(error);
    });
  });

  describe('search', () => {
    test('검색어와 필터가 포함된 쿼리로 ES를 호출해야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: '맛집',
        tags: ['여행'],
        hasImage: true,
        isFavorite: false,
        size: 10,
      };

      mockElasticsearchService.search.mockResolvedValue({
        hits: {
          total: { value: 1, relation: 'eq' },
          hits: [{ _source: { publicId: 'rec_1' } }],
        },
      });

      // when
      await service.search(userId, dto);

      // then
      expect(mockElasticsearchService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 10,
          query: expect.objectContaining({
            bool: expect.objectContaining({
              must: [
                expect.objectContaining({
                  multi_match: expect.objectContaining({ query: '맛집' }),
                }),
              ],
              filter: expect.arrayContaining([
                { term: { userId: '1' } },
                { terms: { tags: ['여행'] } },
                { term: { hasImages: true } },
              ]),
            }),
          }),
        }),
      );
    });

    test('tags 필터가 있을 때만 쿼리에 terms 필터가 포함되어야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'test',
        tags: ['카페'],
        hasImage: false,
        isFavorite: false,
      };
      mockElasticsearchService.search.mockResolvedValue({
        hits: { total: 0, hits: [] },
      });

      // when
      await service.search(userId, dto);

      // then
      const lastCall = mockElasticsearchService.search.mock.calls[0][0];
      const filters = lastCall.query.bool.filter;

      expect(filters).toContainEqual({ terms: { tags: ['카페'] } });
      expect(filters).not.toContainEqual({ term: { hasImages: true } });
      expect(filters).not.toContainEqual({ term: { isFavorite: true } });
    });

    test('isFavorite이 true일 때만 isFavorite 필터가 포함되어야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'test',
        isFavorite: true,
        hasImage: false,
      };
      mockElasticsearchService.search.mockResolvedValue({
        hits: { total: 0, hits: [] },
      });

      // when
      await service.search(userId, dto);

      // then
      const lastCall = mockElasticsearchService.search.mock.calls[0][0];
      expect(lastCall.query.bool.filter).toContainEqual({
        term: { isFavorite: true },
      });
    });

    test('잘못된 형식의 cursor가 전달되면 에러를 던져야 한다', async () => {
      // given
      const userId = 1n;
      const invalidCursor = 'invalid-base64-string';
      const dto: SearchRecordsDto = {
        keyword: 'test',
        isFavorite: true,
        hasImage: false,
        cursor: invalidCursor,
      };

      // when & then
      await expect(service.search(userId, dto)).rejects.toThrow();
    });

    test('Elasticsearch 서버 응답이 실패할 경우 예외를 전파해야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'test',
        isFavorite: true,
        hasImage: false,
      };
      const esError = new Error('ES Server Down');
      mockElasticsearchService.search.mockRejectedValue(esError);

      // when & then
      await expect(service.search(userId, dto)).rejects.toThrow(
        'ES Server Down',
      );
    });

    test('커서(cursor)가 있을 경우 search_after 파라미터를 포함해야 한다', async () => {
      // given
      const userId = 1n;
      const cursorContent = ['sort_val_1', 'sort_val_2'];
      const encodedCursor = Buffer.from(JSON.stringify(cursorContent)).toString(
        'base64',
      );
      const dto: SearchRecordsDto = {
        keyword: 'test',
        cursor: encodedCursor,
        hasImage: false,
        isFavorite: false,
        size: 20,
      };

      mockElasticsearchService.search.mockResolvedValue({
        hits: { total: 0, hits: [] },
      });

      // when
      await service.search(userId, dto);

      // then
      expect(mockElasticsearchService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          search_after: cursorContent,
        }),
      );
    });

    test('검색 결과 데이터(_source)가 누락된 경우에도 안전하게 처리해야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'test',
        hasImage: false,
        isFavorite: false,
      };

      const brokenResult = {
        hits: {
          total: { value: 1 },
          hits: [{ sort: [123] }],
        },
      };

      mockElasticsearchService.search.mockResolvedValue(brokenResult);

      // when
      const result = await service.search(userId, dto);

      // then
      expect(result.hits.hits).toHaveLength(1);
      expect(result.hits.hits[0]._source).toBeUndefined();
    });

    test('검색 결과가 여러 페이지일 때 cursor를 올바르게 생성할 수 있어야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'multi-page',
        hasImage: false,
        isFavorite: false,
        size: 2,
      };

      const mockResult = {
        hits: {
          total: { value: 10, relation: 'eq' },
          hits: [
            {
              _source: { publicId: 'rec_1', title: 'First' },
              sort: [1704067200000, 'rec_1'],
            },
            {
              _source: { publicId: 'rec_2', title: 'Second' },
              sort: [1704153600000, 'rec_2'],
            },
          ],
        },
      };

      mockElasticsearchService.search.mockResolvedValue(mockResult);

      // when
      const result = await service.search(userId, dto);

      // then
      expect(result.hits.hits).toHaveLength(2);
      expect(result.hits.hits[1].sort).toEqual([1704153600000, 'rec_2']);
    });

    test('빈 검색 결과에 대해서도 올바른 응답을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'nonexistent',
        hasImage: false,
        isFavorite: false,
      };

      mockElasticsearchService.search.mockResolvedValue({
        hits: {
          total: { value: 0, relation: 'eq' },
          hits: [],
        },
      });

      // when
      const result = await service.search(userId, dto);

      // then
      expect(result.hits.hits).toEqual([]);
      expect(result.hits.total).toEqual({ value: 0, relation: 'eq' });
    });

    test('size가 지정되지 않은 경우 기본값(20)으로 검색해야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'default-size',
        hasImage: false,
        isFavorite: false,
        // size가 없음
      };

      mockElasticsearchService.search.mockResolvedValue({
        hits: { total: 0, hits: [] },
      });

      // when
      await service.search(userId, dto);

      // then
      expect(mockElasticsearchService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 20,
        }),
      );
    });
  });

  describe('upsertRecord', () => {
    const payload: RecordSyncPayload = {
      recordId: '123',
      publicId: 'pub-123',
      userId: '456',
      title: '테스트 레코드',
      content: '테스트 내용',
      isFavorite: false,
      locationName: '서울시 강남구',
      locationAddress: '서울특별시 강남구 역삼동 396',
      tags: ['여행', '맛집'],
      hasImages: true,
      thumbnailImage: 'https://example.com/image.jpg',
      connectionsCount: 5,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    test('스냅샷 전체를 기록 ID를 문서 ID로, 이벤트 버전과 함께 alias에 써야 한다', async () => {
      // given
      mockElasticsearchService.indexDocument.mockResolvedValue('APPLIED');

      // when
      const result = await service.upsertRecord(payload, 42);

      // then
      expect(mockElasticsearchService.indexDocument).toHaveBeenCalledTimes(1);
      expect(mockElasticsearchService.indexDocument).toHaveBeenCalledWith(
        RECORD_INDEX_ALIAS,
        '123',
        payload,
        42,
      );
      expect(result).toBe('APPLIED');
    });

    test('이미 더 최신 버전이 반영돼 있으면 STALE을 예외 없이 돌려줘야 한다', async () => {
      // given
      mockElasticsearchService.indexDocument.mockResolvedValue('STALE');

      // when & then
      await expect(service.upsertRecord(payload, 3)).resolves.toBe('STALE');
    });

    test('ES 쓰기 중 에러가 발생하면 예외를 전파해야 한다', async () => {
      // given
      const error = new Error('Elasticsearch connection failed');
      mockElasticsearchService.indexDocument.mockRejectedValue(error);

      // when & then
      await expect(service.upsertRecord(payload, 42)).rejects.toThrow(error);
    });
  });

  describe('deleteRecord', () => {
    test('기록 문서를 삭제 버전과 함께 삭제해야 한다', async () => {
      // given
      mockElasticsearchService.deleteDocument.mockResolvedValue('APPLIED');

      // when
      const result = await service.deleteRecord('123', 9);

      // then
      expect(mockElasticsearchService.deleteDocument).toHaveBeenCalledTimes(1);
      expect(mockElasticsearchService.deleteDocument).toHaveBeenCalledWith(
        RECORD_INDEX_ALIAS,
        '123',
        9,
      );
      expect(result).toBe('APPLIED');
    });

    test('이미 더 최신 삭제/수정 버전이 반영돼 있으면 STALE을 돌려줘야 한다', async () => {
      // given
      mockElasticsearchService.deleteDocument.mockResolvedValue('STALE');

      // when & then
      await expect(service.deleteRecord('123', 1)).resolves.toBe('STALE');
    });

    test('삭제 실패 시 예외를 전파해야 한다', async () => {
      // given
      const error = new Error('Delete failed');
      mockElasticsearchService.deleteDocument.mockRejectedValue(error);

      // when & then
      await expect(service.deleteRecord('999', 9)).rejects.toThrow(error);
    });
  });
});
