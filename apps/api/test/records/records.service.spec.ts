import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from '@/records/records.service';
import { PrismaService } from '@/prisma/prisma.service';
import { OutboxService } from '@/outbox/outbox.service';
import { UsersService } from '@/users/users.service';
import { ObjectStorageService } from '@/records/services/object-storage.service';
import { RecordSearchService } from '@/records/services/records-search.service';
import { RecordTagsService } from '@/records/services/records-tags.service';
import { RecordImageService } from '@/records/services/records-image.service';
import { RecordQueryService } from '@/records/services/records-query.service';
import { RecordGraphService } from '@/records/services/records-graph.service';
import { RecordLocationService } from '@/records/services/records-location.service';
import {
  RecordNotFoundException,
  RecordAccessDeniedException,
  InvalidBoundsException,
  RecordCreationFailedException,
  RecordDeletionFailedException,
} from '@/records/exceptions/record.exceptions';

describe('RecordsService', () => {
  let service: RecordsService;

  const mockPrismaService = {
    record: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockOutboxService = {
    publish: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockObjectStorageService = {
    deleteImages: jest.fn(),
  };

  const mockRecordSearchService = {
    search: jest.fn(),
  };

  const mockRecordTagsService = {
    getRecordTags: jest.fn(),
    getTagsByRecordIds: jest.fn(),
    createRecordTags: jest.fn(),
    updateRecordTags: jest.fn(),
    convertTagPublicIdsToIds: jest.fn(),
  };

  const mockRecordImageService = {
    getImagesByRecordIds: jest.fn(),
    processAndUploadImages: jest.fn(),
    saveImages: jest.fn(),
    deleteImagesFromStorage: jest.fn(),
  };

  const mockRecordQueryService = {
    getRecordsInBounds: jest.fn(),
    getRecordsByLocation: jest.fn(),
    getAllRecords: jest.fn(),
  };

  const mockRecordGraphService = {
    getGraph: jest.fn(),
    getGraphNeighborDetail: jest.fn(),
  };

  const mockRecordLocationService = {
    getLocationInfo: jest.fn(),
    updateRecordLocation: jest.fn(),
    getRecordWithLocation: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OutboxService, useValue: mockOutboxService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ObjectStorageService, useValue: mockObjectStorageService },
        { provide: RecordSearchService, useValue: mockRecordSearchService },
        { provide: RecordTagsService, useValue: mockRecordTagsService },
        { provide: RecordImageService, useValue: mockRecordImageService },
        { provide: RecordQueryService, useValue: mockRecordQueryService },
        { provide: RecordGraphService, useValue: mockRecordGraphService },
        { provide: RecordLocationService, useValue: mockRecordLocationService },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
  });

  describe('findOneByPublicId', () => {
    test('publicId로 레코드를 조회하여 반환해야 한다', async () => {
      // given
      const publicId = 'rec_123';
      const mockRecord = {
        id: 100n,
        publicId: 'rec_123',
        userId: 1n,
        title: '테스트 레코드',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);

      // when
      const result = await service.findOneByPublicId(publicId);

      // then
      expect(mockPrismaService.record.findUnique).toHaveBeenCalledWith({
        where: { publicId },
      });
      expect(result).toEqual(mockRecord);
    });

    test('레코드가 존재하지 않으면 RecordNotFoundException을 던져야 한다', async () => {
      // given
      const publicId = 'rec_not_exist';
      mockPrismaService.record.findUnique.mockResolvedValue(null);

      // when & then
      await expect(service.findOneByPublicId(publicId)).rejects.toThrow(
        RecordNotFoundException,
      );
    });
  });

  describe('getRecordDetail', () => {
    test('레코드 상세 정보를 조회하여 RecordResponseDto로 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';

      const mockRecord = {
        id: 100n,
        publicId: 'rec_123',
        userId: 1n,
        title: '테스트',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockRecordWithLocation = {
        ...mockRecord,
        longitude: 126.978,
        latitude: 37.5665,
      };

      const mockTags = [
        { publicId: 'tag_1', name: '여행' },
        { publicId: 'tag_2', name: '맛집' },
      ];

      const mockImagesMap = new Map();
      mockImagesMap.set(100n, [
        {
          publicId: 'img_1',
          order: 0,
          thumbnailUrl: 'https://example.com/thumb.jpg',
          thumbnailWidth: 200,
          thumbnailHeight: 200,
          thumbnailSize: 500,
          mediumUrl: 'https://example.com/medium.jpg',
          mediumWidth: 800,
          mediumHeight: 600,
          mediumSize: 1500,
          originalUrl: 'https://example.com/original.jpg',
          originalWidth: 1920,
          originalHeight: 1080,
          originalSize: 3000,
        },
      ]);

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);
      mockRecordLocationService.getRecordWithLocation.mockResolvedValue(
        mockRecordWithLocation,
      );
      mockRecordTagsService.getRecordTags.mockResolvedValue(mockTags);
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(
        mockImagesMap,
      );

      // when
      const result = await service.getRecordDetail(userId, publicId);

      // then
      expect(mockPrismaService.record.findUnique).toHaveBeenCalledWith({
        where: { publicId },
      });
      expect(
        mockRecordLocationService.getRecordWithLocation,
      ).toHaveBeenCalled();
      expect(mockRecordTagsService.getRecordTags).toHaveBeenCalledWith(100n);
      expect(mockRecordImageService.getImagesByRecordIds).toHaveBeenCalledWith({
        recordIds: [100n],
      });
      expect(result).toBeDefined();
    });

    test('다른 사용자의 레코드를 조회하면 RecordAccessDeniedException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';

      const mockRecord = {
        id: 100n,
        publicId: 'rec_123',
        userId: 999n, // 다른 사용자
        title: '테스트',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);

      // when & then
      await expect(service.getRecordDetail(userId, publicId)).rejects.toThrow(
        RecordAccessDeniedException,
      );
    });
  });

  describe('getRecordsInBounds', () => {
    test('지도 범위 내의 레코드들을 조회하여 RecordListResponseDto로 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        swLng: 126.9,
        swLat: 37.4,
        neLng: 127.1,
        neLat: 37.6,
        page: 1,
        limit: 10,
        sortOrder: 'desc' as const,
      };

      const mockRecords = [
        {
          id: 10n,
          publicId: 'rec_1',
          title: '강남역',
          content: '내용',
          locationName: '강남역',
          locationAddress: '서울시 강남구',
          longitude: 127.0276,
          latitude: 37.4979,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
      ];

      mockRecordQueryService.getRecordsInBounds.mockResolvedValue({
        records: mockRecords,
        totalCount: 1,
      });
      mockRecordTagsService.getTagsByRecordIds.mockResolvedValue(new Map());
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.getRecordsInBounds(userId, dto);

      // then
      expect(mockRecordQueryService.getRecordsInBounds).toHaveBeenCalledWith(
        userId,
        {
          swLng: 126.9,
          swLat: 37.4,
          neLng: 127.1,
          neLat: 37.6,
        },
        { limit: 10, offset: 0 },
        'desc',
      );
      expect(result).toBeDefined();
    });

    test('북동쪽 위도가 남서쪽 위도보다 작거나 같으면 InvalidBoundsException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        swLng: 126.9,
        swLat: 37.6,
        neLng: 127.1,
        neLat: 37.4, // 남서쪽보다 작음
        page: 1,
        limit: 10,
        sortOrder: 'desc' as const,
      };

      // when & then
      await expect(service.getRecordsInBounds(userId, dto)).rejects.toThrow(
        InvalidBoundsException,
      );
    });
  });

  describe('getRecordsByLocation', () => {
    test('특정 위치 반경 내의 레코드들을 조회하여 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        latitude: 37.5665,
        longitude: 126.978,
        radius: 1000,
        page: 1,
        limit: 10,
        sortOrder: 'desc' as const,
      };

      const mockRecords = [
        {
          id: 10n,
          publicId: 'rec_1',
          title: '서울시청',
          content: '내용',
          locationName: '서울시청',
          locationAddress: '서울시 중구',
          longitude: 126.978,
          latitude: 37.5665,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
      ];

      mockRecordQueryService.getRecordsByLocation.mockResolvedValue({
        records: mockRecords,
        totalCount: 1,
      });
      mockRecordTagsService.getTagsByRecordIds.mockResolvedValue(new Map());
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.getRecordsByLocation(userId, dto);

      // then
      expect(mockRecordQueryService.getRecordsByLocation).toHaveBeenCalledWith(
        userId,
        {
          latitude: 37.5665,
          longitude: 126.978,
          radius: 1000,
        },
        { limit: 10, offset: 0 },
        'desc',
      );
      expect(result).toBeDefined();
    });
  });

  describe('getAllRecords', () => {
    test('필터 조건에 맞는 모든 레코드들을 조회하여 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        tagPublicIds: ['tag_1', 'tag_2'],
        page: 1,
        limit: 10,
        sortOrder: 'desc' as const,
      };

      const mockRecords = [
        {
          id: 10n,
          publicId: 'rec_1',
          title: '테스트',
          content: '내용',
          locationName: '서울',
          locationAddress: '서울시',
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
      ];

      mockRecordTagsService.convertTagPublicIdsToIds.mockResolvedValue([
        10n,
        11n,
      ]);
      mockRecordQueryService.getAllRecords.mockResolvedValue({
        records: mockRecords,
        totalCount: 1,
      });
      mockRecordTagsService.getTagsByRecordIds.mockResolvedValue(new Map());
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.getAllRecords(userId, dto);

      // then
      expect(
        mockRecordTagsService.convertTagPublicIdsToIds,
      ).toHaveBeenCalledWith(userId, ['tag_1', 'tag_2']);
      expect(mockRecordQueryService.getAllRecords).toHaveBeenCalled();
      expect(mockRecordImageService.getImagesByRecordIds).toHaveBeenCalledWith({
        recordIds: [10n],
        onlyFirst: true,
      });
      expect(result).toBeDefined();
    });
  });

  describe('searchRecords', () => {
    test('검색 결과를 SearchRecordListResponseDto로 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        keyword: 'test',
        hasImage: false,
        isFavorite: false,
        size: 10,
      };

      const mockSearchResult = {
        hits: {
          total: { value: 5 },
          hits: [
            {
              _source: {
                publicId: 'rec_1',
                title: 'Test',
                createdAt: '2024-01-15T10:00:00Z',
                connectionsCount: 0,
                tags: [],
                isFavorite: false,
              },
              sort: [1705315200000, 'rec_1'],
            },
          ],
        },
      };

      mockRecordSearchService.search.mockResolvedValue(mockSearchResult);

      // when
      const result = await service.searchRecords(userId, dto);

      // then
      expect(mockRecordSearchService.search).toHaveBeenCalledWith(userId, {
        ...dto,
        size: 11, // originalSize + 1
      });
      expect(result).toBeDefined();
      expect(result.pagination.totalCount).toBe(5);
    });

    test('검색 결과가 size보다 많으면 hasMore가 true여야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        keyword: 'test',
        hasImage: false,
        isFavorite: false,
        size: 2,
      };

      const mockSearchResult = {
        hits: {
          total: { value: 10 },
          hits: [
            {
              _source: { publicId: 'rec_1' },
              sort: [1, 'rec_1'],
            },
            {
              _source: { publicId: 'rec_2' },
              sort: [2, 'rec_2'],
            },
            {
              _source: { publicId: 'rec_3' },
              sort: [3, 'rec_3'],
            },
          ],
        },
      };

      mockRecordSearchService.search.mockResolvedValue(mockSearchResult);

      // when
      const result = await service.searchRecords(userId, dto);

      // then
      expect(result.pagination.hasMore).toBe(true);
      expect(result.records).toHaveLength(2);
      expect(result.pagination.nextCursor).toBeDefined();
    });
  });

  describe('getGraph', () => {
    test('그래프 데이터를 조회하여 반환해야 한다', async () => {
      // given
      const startRecordPublicId = 'rec_start';
      const userId = 1n;

      const mockGraphResponse = {
        nodes: [
          {
            publicId: 'rec_a',
            location: { latitude: 37.1, longitude: 127.1 },
          },
        ],
        edges: [],
        meta: {
          start: 'rec_start',
          nodeCount: 1,
          edgeCount: 0,
          truncated: false,
        },
      };

      mockRecordGraphService.getGraph.mockResolvedValue(mockGraphResponse);

      // when
      const result = await service.getGraph(startRecordPublicId, userId);

      // then
      expect(mockRecordGraphService.getGraph).toHaveBeenCalledWith(
        startRecordPublicId,
        userId,
      );
      expect(result).toEqual(mockGraphResponse);
    });
  });

  describe('getGraphNeighborDetail', () => {
    test('인접 노드의 상세 정보를 조회하여 반환해야 한다', async () => {
      // given
      const startRecordPublicId = 'rec_start';
      const userId = 1n;

      const mockNeighborDetails = [
        {
          publicId: 'rec_a',
          title: '인접 레코드',
          location: {
            latitude: 37.1,
            longitude: 127.1,
            name: '장소',
            address: '주소',
          },
          tags: [],
          thumbnail: null,
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      ];

      mockRecordGraphService.getGraphNeighborDetail.mockResolvedValue(
        mockNeighborDetails,
      );

      // when
      const result = await service.getGraphNeighborDetail(
        startRecordPublicId,
        userId,
      );

      // then
      expect(
        mockRecordGraphService.getGraphNeighborDetail,
      ).toHaveBeenCalledWith(startRecordPublicId, userId);
      expect(result).toEqual(mockNeighborDetails);
    });
  });

  describe('createRecord', () => {
    test('이미지 없이도 레코드를 생성해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        title: '새 레코드',
        content: '내용',
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
        tags: ['tag_1'],
      };

      const mockLocationInfo = {
        name: '서울시청',
        address: '서울시 중구',
      };

      const mockCreatedRecord = {
        id: 100n,
        publicId: 'rec_new',
        userId,
        title: '새 레코드',
        content: '내용',
        locationName: '서울시청',
        locationAddress: '서울시 중구',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockUpdatedRecord = {
        ...mockCreatedRecord,
        longitude: 126.978,
        latitude: 37.5665,
      };

      const mockTags = [{ publicId: 'tag_1', name: '여행' }];

      mockRecordLocationService.getLocationInfo.mockResolvedValue(
        mockLocationInfo,
      );

      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            create: jest.fn().mockResolvedValue(mockCreatedRecord),
          },
        };
        return callback(mockTx);
      });

      mockRecordLocationService.updateRecordLocation.mockResolvedValue(
        mockUpdatedRecord,
      );
      mockRecordTagsService.createRecordTags.mockResolvedValue(mockTags);
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.createRecord(userId, dto);

      // then
      expect(mockRecordLocationService.getLocationInfo).toHaveBeenCalledWith(
        37.5665,
        126.978,
      );
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('이미지와 함께 레코드를 생성해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        title: '이미지 레코드',
        content: '내용',
        location: {
          latitude: 37.5665,
          longitude: 126.978,
        },
        tags: [],
      };

      const mockImages = [
        {
          fieldname: 'images',
          originalname: 'test.jpg',
          buffer: Buffer.from('fake-image'),
        } as Express.Multer.File,
      ];

      const mockUser = { publicId: 'user_123' };
      const mockLocationInfo = { name: '서울시청', address: '서울시 중구' };
      const mockProcessedResult = {
        uploadedImages: [
          {
            imageId: 'img_1',
            urls: {
              thumbnail: 'https://cdn.example.com/thumb.jpg',
              medium: 'https://cdn.example.com/medium.jpg',
              original: 'https://cdn.example.com/original.jpg',
            },
          },
        ],
        uploadedKeys: ['key1', 'key2', 'key3'],
        processedImages: [
          {
            imageId: 'img_1',
            variants: {
              thumbnail: {
                buffer: Buffer.from('t'),
                width: 200,
                height: 200,
                size: 500,
              },
              medium: {
                buffer: Buffer.from('m'),
                width: 800,
                height: 600,
                size: 1500,
              },
              original: {
                buffer: Buffer.from('o'),
                width: 1920,
                height: 1080,
                size: 3000,
              },
            },
          },
        ],
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockRecordLocationService.getLocationInfo.mockResolvedValue(
        mockLocationInfo,
      );
      mockRecordImageService.processAndUploadImages.mockResolvedValue(
        mockProcessedResult,
      );

      const mockCreatedRecord = {
        id: 100n,
        publicId: 'rec_new_with_image',
        userId,
        title: '이미지 레코드',
        content: '내용',
        locationName: '서울시청',
        locationAddress: '서울시 중구',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockUpdatedRecord = {
        ...mockCreatedRecord,
        longitude: 126.978,
        latitude: 37.5665,
      };

      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: { create: jest.fn().mockResolvedValue(mockCreatedRecord) },
        };
        return callback(mockTx);
      });

      mockRecordLocationService.updateRecordLocation.mockResolvedValue(
        mockUpdatedRecord,
      );
      mockRecordTagsService.createRecordTags.mockResolvedValue([]);
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.createRecord(userId, dto, mockImages);

      // then
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(mockRecordImageService.processAndUploadImages).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('레코드 생성 중 에러가 발생하면 RecordCreationFailedException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        title: '실패할 레코드',
        content: '내용',
        location: { latitude: 37.5665, longitude: 126.978 },
        tags: [],
      };

      mockRecordLocationService.getLocationInfo.mockResolvedValue({
        name: '서울',
        address: '서울시',
      });

      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      // when & then
      await expect(service.createRecord(userId, dto)).rejects.toThrow(
        RecordCreationFailedException,
      );
    });

    test('이미지 업로드 후 트랜잭션 실패 시 업로드된 이미지를 삭제해야 한다', async () => {
      // given
      const userId = 1n;
      const dto = {
        title: '트랜잭션 실패',
        content: '내용',
        location: { latitude: 37.5665, longitude: 126.978 },
        tags: [],
      };

      const mockImages = [
        { buffer: Buffer.from('image') } as Express.Multer.File,
      ];

      const uploadedKeys = ['key1', 'key2', 'key3'];

      mockUsersService.findById.mockResolvedValue({ publicId: 'user_123' });
      mockRecordLocationService.getLocationInfo.mockResolvedValue({
        name: '서울',
        address: '서울시',
      });
      mockRecordImageService.processAndUploadImages.mockResolvedValue({
        uploadedImages: [],
        uploadedKeys,
        processedImages: [],
      });
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      // when & then
      await expect(
        service.createRecord(userId, dto, mockImages),
      ).rejects.toThrow();

      expect(mockObjectStorageService.deleteImages).toHaveBeenCalledWith(
        uploadedKeys,
      );
    });
  });

  describe('updateRecord', () => {
    test('레코드를 업데이트하고 업데이트된 정보를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';
      const dto = {
        title: '수정된 제목',
        content: '수정된 내용',
      };

      const mockExisting = {
        id: 100n,
        publicId: 'rec_123',
        userId,
        title: '원래 제목',
        content: '원래 내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockUpdated = {
        ...mockExisting,
        title: '수정된 제목',
        content: '수정된 내용',
      };

      const mockUpdatedWithLocation = {
        ...mockUpdated,
        longitude: 126.978,
        latitude: 37.5665,
      };

      const mockTags = [{ publicId: 'tag_1', name: '여행' }];

      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            findFirst: jest.fn().mockResolvedValue(mockExisting),
            update: jest.fn().mockResolvedValue(mockUpdated),
          },
        };
        return callback(mockTx);
      });

      mockRecordLocationService.getRecordWithLocation.mockResolvedValue(
        mockUpdatedWithLocation,
      );
      mockRecordTagsService.getRecordTags.mockResolvedValue(mockTags);
      mockRecordImageService.getImagesByRecordIds.mockResolvedValue(new Map());

      // when
      const result = await service.updateRecord(userId, publicId, dto);

      // then
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('존재하지 않는 레코드를 업데이트하면 RecordNotFoundException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_not_exist';
      const dto = { title: '수정' };

      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx);
      });

      // when & then
      await expect(service.updateRecord(userId, publicId, dto)).rejects.toThrow(
        RecordNotFoundException,
      );
    });

    test('다른 사용자의 레코드를 업데이트하면 RecordAccessDeniedException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';
      const dto = { title: '수정' };

      const mockExisting = {
        id: 100n,
        publicId: 'rec_123',
        userId: 999n, // 다른 사용자
        title: '제목',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            findFirst: jest.fn().mockResolvedValue(mockExisting),
          },
        };
        return callback(mockTx);
      });

      // when & then
      await expect(service.updateRecord(userId, publicId, dto)).rejects.toThrow(
        RecordAccessDeniedException,
      );
    });
  });

  describe('updateFavoriteInRecord', () => {
    test('즐겨찾기 상태를 변경하고 업데이트된 정보를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';
      const requestedIsFavorite = true;

      const mockRecord = {
        id: 100n,
        publicId: 'rec_123',
        userId,
        title: '테스트',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedRecord = {
        id: 100n,
        publicId: 'rec_123',
        isFavorite: true,
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);
      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            update: jest.fn().mockResolvedValue(mockUpdatedRecord),
          },
        };
        return callback(mockTx);
      });

      // when
      const result = await service.updateFavoriteInRecord(
        userId,
        publicId,
        requestedIsFavorite,
      );

      // then
      expect(result.publicId).toBe('rec_123');
      expect(result.isFavorite).toBe(true);
    });

    test('이미 동일한 즐겨찾기 상태면 업데이트하지 않고 현재 상태를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';
      const requestedIsFavorite = true;

      const mockRecord = {
        id: 100n,
        publicId: 'rec_123',
        userId,
        title: '테스트',
        content: '내용',
        locationName: '서울',
        locationAddress: '서울시',
        isFavorite: true, // 이미 true
        connectionsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);

      // when
      const result = await service.updateFavoriteInRecord(
        userId,
        publicId,
        requestedIsFavorite,
      );

      // then
      expect(result.publicId).toBe('rec_123');
      expect(result.isFavorite).toBe(true);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('deleteRecord', () => {
    test('레코드와 이미지를 삭제해야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';

      const mockRecord = {
        id: 100n,
        userId,
        publicId: 'rec_123',
        images: [
          {
            thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
            mediumUrl: 'https://cdn.example.com/medium.jpg',
            originalUrl: 'https://cdn.example.com/original.jpg',
          },
        ],
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);
      mockPrismaService.$transaction.mockImplementation((callback) => {
        const mockTx = {
          record: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });
      mockRecordImageService.deleteImagesFromStorage.mockResolvedValue(
        undefined,
      );

      // when
      await service.deleteRecord(userId, publicId);

      // then
      expect(mockPrismaService.record.findUnique).toHaveBeenCalledWith({
        where: { publicId },
        select: expect.objectContaining({
          id: true,
          userId: true,
          publicId: true,
          images: expect.any(Object),
        }),
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockRecordImageService.deleteImagesFromStorage).toHaveBeenCalled();
    });

    test('존재하지 않는 레코드를 삭제하면 RecordNotFoundException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_not_exist';

      mockPrismaService.record.findUnique.mockResolvedValue(null);

      // when & then
      await expect(service.deleteRecord(userId, publicId)).rejects.toThrow(
        RecordNotFoundException,
      );
    });

    test('다른 사용자의 레코드를 삭제하면 RecordAccessDeniedException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';

      const mockRecord = {
        id: 100n,
        userId: 999n, // 다른 사용자
        publicId: 'rec_123',
        images: [],
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);

      // when & then
      await expect(service.deleteRecord(userId, publicId)).rejects.toThrow(
        RecordAccessDeniedException,
      );
    });

    test('DB 삭제 중 에러가 발생하면 RecordDeletionFailedException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const publicId = 'rec_123';

      const mockRecord = {
        id: 100n,
        userId,
        publicId: 'rec_123',
        images: [],
      };

      mockPrismaService.record.findUnique.mockResolvedValue(mockRecord);
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('DB deletion failed'),
      );

      // when & then
      await expect(service.deleteRecord(userId, publicId)).rejects.toThrow(
        RecordDeletionFailedException,
      );
    });
  });

  describe('incrementConnectionsCount', () => {
    test('연결 수를 증가시키고 Outbox 이벤트를 발행해야 한다', async () => {
      // given
      const recordId = 100n;
      const delta = 1;

      const mockTx = {
        record: {
          update: jest.fn().mockResolvedValue({
            id: 100n,
            connectionsCount: 6,
          }),
        },
      } as any;

      mockOutboxService.publish.mockResolvedValue(undefined);

      // when
      const result = await service.incrementConnectionsCount(
        mockTx,
        recordId,
        delta,
      );

      // then
      expect(mockTx.record.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: { connectionsCount: { increment: delta } },
        select: { id: true, connectionsCount: true },
      });
      expect(mockOutboxService.publish).toHaveBeenCalled();
      expect(result.connectionsCount).toBe(6);
    });
  });
});
