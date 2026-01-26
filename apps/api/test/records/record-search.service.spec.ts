import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { RecordSearchService } from '../../src/records/records-search.service';
import { RecordSyncPayload } from '../../src/records/type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_MAPPING,
} from '../../src/records/constants/record-search.constant';
import { ESDocumentNotFoundException } from '@/records/exceptions/record.exceptions';
import { SearchRecordsDto } from '@/records/dto/search-records.dto';

describe('RecordSearchService', () => {
  let service: RecordSearchService;

  const mockElasticsearchService = {
    index: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    indices: {
      exists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordSearchService,
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
      mockElasticsearchService.indices.exists.mockResolvedValue(false);
      mockElasticsearchService.indices.create.mockResolvedValue({} as any);

      // when
      await service.onModuleInit();

      // then
      expect(mockElasticsearchService.indices.exists).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
      });
      expect(mockElasticsearchService.indices.create).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        settings: RECORD_INDEX_SETTINGS,
        mappings: RECORD_SEARCH_MAPPING,
      });
    });

    test('인덱스가 이미 존재하면 생성하지 않아야 한다', async () => {
      // given
      mockElasticsearchService.indices.exists.mockResolvedValue(true);

      // when
      await service.onModuleInit();

      // then
      expect(mockElasticsearchService.indices.exists).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
      });
      expect(mockElasticsearchService.indices.create).not.toHaveBeenCalled();
    });

    test('인덱스 생성 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const error = new Error('Index 생성 실패');
      mockElasticsearchService.indices.exists.mockResolvedValue(false);
      mockElasticsearchService.indices.create.mockRejectedValue(error);

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
                { term: { userId: 1 } },
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

    test('isFavorite이 true일 때만 isFavorite 필터가 포함되어 bear 한다', async () => {
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
  });

  describe('indexRecord', () => {
    test('레코드를 Elasticsearch에 인덱싱해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '123',
        publicId: 'pub-123',
        userId: '456',
        title: '테스트 레코드',
        content: '테스트 내용',
        isFavorite: false,
        locationName: '서울시 강남구',
        tags: ['여행', '맛집'],
        hasImages: true,
        thumbnailImage: 'https://example.com/image.jpg',
        connectionsCount: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      mockElasticsearchService.index.mockResolvedValue({} as any);

      // when
      await service.indexRecord(payload);

      // then
      expect(mockElasticsearchService.index).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: '123',
        document: payload,
      });
      expect(mockElasticsearchService.index).toHaveBeenCalledTimes(1);
    });

    test('인덱싱 중 에러가 발생하면 예외를 전파해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '123',
        publicId: 'pub-123',
        userId: '456',
        title: '테스트',
        content: '내용',
        isFavorite: false,
        locationName: '서울',
        tags: ['태그'],
        hasImages: false,
        thumbnailImage: null,
        connectionsCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      const error = new Error('Indexing failed');
      mockElasticsearchService.index.mockRejectedValue(error);

      // when & then
      await expect(service.indexRecord(payload)).rejects.toThrow(error);
    });

    test('content가 null인 경우에도 정상적으로 인덱싱해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '100',
        publicId: 'pub-100',
        userId: '200',
        title: 'No Content',
        content: null,
        isFavorite: false,
        locationName: '제주',
        tags: [],
        hasImages: false,
        thumbnailImage: null,
        connectionsCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      mockElasticsearchService.index.mockResolvedValue({} as any);

      // when
      await service.indexRecord(payload);

      // then
      expect(mockElasticsearchService.index).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: '100',
        document: payload,
      });
    });

    test('thumbnailImage가 null인 경우에도 정상적으로 인덱싱해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '200',
        publicId: 'pub-200',
        userId: '300',
        title: 'No Thumbnail',
        content: 'Some content',
        isFavorite: true,
        locationName: '인천',
        tags: ['테스트'],
        hasImages: false,
        thumbnailImage: null,
        connectionsCount: 3,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      mockElasticsearchService.index.mockResolvedValue({} as any);

      // when
      await service.indexRecord(payload);

      // then
      expect(mockElasticsearchService.index).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: '200',
        document: payload,
      });
    });

    test('태그가 빈 배열인 경우에도 정상적으로 인덱싱해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '300',
        publicId: 'pub-300',
        userId: '400',
        title: 'No Tags',
        content: 'Content',
        isFavorite: false,
        locationName: '대전',
        tags: [],
        hasImages: true,
        thumbnailImage: 'https://example.com/thumb.jpg',
        connectionsCount: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      mockElasticsearchService.index.mockResolvedValue({} as any);

      // when
      await service.indexRecord(payload);

      // then
      expect(mockElasticsearchService.index).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: '300',
        document: expect.objectContaining({
          tags: [],
        }),
      });
    });
  });

  describe('updateRecord', () => {
    test('기록정보를 Elasticsearch에서 부분 업데이트해야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '123',
        publicId: 'pub-123',
        userId: '456',
        title: '업데이트된 레코드',
        content: '업데이트된 내용',
        isFavorite: true,
        locationName: '서울시 강남구',
        tags: ['수정', '업데이트'],
        hasImages: true,
        thumbnailImage: 'https://example.com/updated.jpg',
        connectionsCount: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      mockElasticsearchService.update.mockResolvedValue({} as any);

      // when
      await service.updateRecord(payload);

      // then
      expect(mockElasticsearchService.update).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: '123',
        doc: payload,
      });
      expect(mockElasticsearchService.update).toHaveBeenCalledTimes(1);
    });

    test('업데이트 실패 시 예외를 던져야 한다', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '999',
        publicId: 'pub-999',
        userId: '111',
        title: '업데이트 실패',
        content: 'Content',
        isFavorite: false,
        locationName: '서울',
        tags: [],
        hasImages: false,
        thumbnailImage: null,
        connectionsCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      const error = new Error('Update failed');
      mockElasticsearchService.update.mockRejectedValue(error);

      // when & then
      await expect(service.updateRecord(payload)).rejects.toThrow(error);
    });

    test('docs가 없으면 NotFound 커스텀 예외를 던져야 한다.', async () => {
      // given
      const payload: RecordSyncPayload = {
        recordId: '777',
        publicId: 'pub-777',
        userId: '888',
        title: 'New Record',
        content: 'New Content',
        isFavorite: false,
        locationName: '인천',
        tags: ['신규'],
        hasImages: false,
        thumbnailImage: null,
        connectionsCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const elastic404Error = new errors.ResponseError({
        body: { error: 'not_found' },
        statusCode: 404,
        warnings: null,
        meta: {} as any,
      });
      mockElasticsearchService.update.mockRejectedValue(elastic404Error);
      // when & then
      await expect(service.updateRecord(payload)).rejects.toThrow(
        ESDocumentNotFoundException,
      );
    });
  });

  describe('deleteRecord', () => {
    test('기록 정보를 Elasticsearch에서 삭제해야 한다', async () => {
      // given
      const recordId = '123';
      mockElasticsearchService.delete = jest.fn().mockResolvedValue({} as any);

      // when
      await service.deleteRecord(recordId);

      // then
      expect(mockElasticsearchService.delete).toHaveBeenCalledWith({
        index: RECORD_INDEX_NAME,
        id: recordId,
      });
      expect(mockElasticsearchService.delete).toHaveBeenCalledTimes(1);
    });

    test('404 외의 삭제 실패 시 예외를 던져야 한다', async () => {
      // given
      const recordId = '999';
      const error = new Error('Delete failed');
      mockElasticsearchService.delete = jest.fn().mockRejectedValue(error);

      // when & then
      await expect(service.deleteRecord(recordId)).rejects.toThrow(error);
    });
  });
});
