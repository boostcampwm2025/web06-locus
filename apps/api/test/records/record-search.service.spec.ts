import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecordSearchService } from '../../src/records/records-search.service';
import { RecordSyncPayload } from '../../src/records/type/record-sync.types';
import {
  RECORD_INDEX_NAME,
  RECORD_INDEX_SETTINGS,
  RECORD_SEARCH_MAPPING,
} from '../../src/records/constants/record-search.constant';

describe('RecordSearchService', () => {
  let service: RecordSearchService;

  const mockElasticsearchService = {
    index: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
        doc_as_upsert: true,
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

    test('docs가 없으면 upsert로 생성해야 한다', async () => {
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
      mockElasticsearchService.update.mockResolvedValue({} as any);

      // when
      await service.updateRecord(payload);

      // then
      expect(mockElasticsearchService.update).toHaveBeenCalledWith(
        expect.objectContaining({ doc_as_upsert: true }),
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
