import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecordSearchService } from '../../src/records/record-search.service';
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
    indices: {
      exists: jest.fn(),
      create: jest.fn(),
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

    it('인덱스가 이미 존재하면 생성하지 않아야 한다', async () => {
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
});
