import { Test, TestingModule } from '@nestjs/testing';
import { RecordQueryService } from '@/records/services/records-query.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('RecordQueryService', () => {
  let service: RecordQueryService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    record: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordQueryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecordQueryService>(RecordQueryService);
  });

  describe('getRecordsInBounds', () => {
    test('지도 범위 내의 레코드들을 조회하고 총 개수와 함께 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const bounds = {
        swLng: 126.9,
        swLat: 37.4,
        neLng: 127.1,
        neLat: 37.6,
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      const mockRecords = [
        {
          id: 10n,
          publicId: 'rec_1',
          title: '강남역',
          content: '강남역 근처',
          locationName: '강남역',
          locationAddress: '서울특별시 강남구',
          longitude: 127.0276,
          latitude: 37.4979,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          id: 11n,
          publicId: 'rec_2',
          title: '역삼역',
          content: '역삼역 근처',
          locationName: '역삼역',
          locationAddress: '서울특별시 강남구',
          longitude: 127.0368,
          latitude: 37.5006,
          isFavorite: true,
          connectionsCount: 2,
          createdAt: new Date('2024-01-16T10:00:00Z'),
          updatedAt: new Date('2024-01-16T10:00:00Z'),
        },
      ];

      const mockCountResult = [{ count: 2 }];

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockRecords)
        .mockResolvedValueOnce(mockCountResult);

      // when
      const result = await service.getRecordsInBounds(
        userId,
        bounds,
        pagination,
        sortOrder,
      );

      // then
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
      expect(result.records).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.records[0].publicId).toBe('rec_1');
      expect(result.records[1].publicId).toBe('rec_2');
    });

    test('범위 내에 레코드가 없으면 빈 배열과 0개를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const bounds = {
        swLng: 126.0,
        swLat: 36.0,
        neLng: 126.5,
        neLat: 36.5,
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0 }]);

      // when
      const result = await service.getRecordsInBounds(
        userId,
        bounds,
        pagination,
        sortOrder,
      );

      // then
      expect(result.records).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    test('페이지네이션이 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const bounds = {
        swLng: 126.9,
        swLat: 37.4,
        neLng: 127.1,
        neLat: 37.6,
      };
      const pagination = { limit: 5, offset: 10 };
      const sortOrder = 'asc' as const;

      const mockRecords = [
        {
          id: 20n,
          publicId: 'rec_20',
          title: 'Record 20',
          content: 'Content',
          locationName: 'Location',
          locationAddress: 'Address',
          longitude: 127.0,
          latitude: 37.5,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-20T10:00:00Z'),
          updatedAt: new Date('2024-01-20T10:00:00Z'),
        },
      ];

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockRecords)
        .mockResolvedValueOnce([{ count: 25 }]);

      // when
      const result = await service.getRecordsInBounds(
        userId,
        bounds,
        pagination,
        sortOrder,
      );

      // then
      expect(result.records).toHaveLength(1);
      expect(result.totalCount).toBe(25);
    });
  });

  describe('getRecordsByLocation', () => {
    test('특정 좌표 기준 반경 내의 레코드들을 조회하고 총 개수와 함께 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const location = {
        latitude: 37.5665,
        longitude: 126.978,
        radius: 1000, // 1km
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      const mockRecords = [
        {
          id: 30n,
          publicId: 'rec_30',
          title: '서울시청 근처',
          content: '시청역',
          locationName: '서울시청',
          locationAddress: '서울특별시 중구',
          longitude: 126.9778,
          latitude: 37.5662,
          isFavorite: false,
          connectionsCount: 1,
          createdAt: new Date('2024-01-20T10:00:00Z'),
          updatedAt: new Date('2024-01-20T10:00:00Z'),
        },
      ];

      const mockCountResult = [{ count: 1 }];

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockRecords)
        .mockResolvedValueOnce(mockCountResult);

      // when
      const result = await service.getRecordsByLocation(
        userId,
        location,
        pagination,
        sortOrder,
      );

      // then
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
      expect(result.records).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.records[0].publicId).toBe('rec_30');
    });

    test('반경 내에 레코드가 없으면 빈 배열과 0개를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const location = {
        latitude: 37.5665,
        longitude: 126.978,
        radius: 100, // 100m
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0 }]);

      // when
      const result = await service.getRecordsByLocation(
        userId,
        location,
        pagination,
        sortOrder,
      );

      // then
      expect(result.records).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    test('정렬 순서가 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const location = {
        latitude: 37.5665,
        longitude: 126.978,
        radius: 2000,
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'asc' as const;

      const mockRecords = [
        {
          id: 40n,
          publicId: 'rec_40',
          title: 'Old Record',
          content: 'Content',
          locationName: 'Location',
          locationAddress: 'Address',
          longitude: 126.978,
          latitude: 37.5665,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-10T10:00:00Z'),
          updatedAt: new Date('2024-01-10T10:00:00Z'),
        },
        {
          id: 41n,
          publicId: 'rec_41',
          title: 'New Record',
          content: 'Content',
          locationName: 'Location',
          locationAddress: 'Address',
          longitude: 126.978,
          latitude: 37.5665,
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-20T10:00:00Z'),
          updatedAt: new Date('2024-01-20T10:00:00Z'),
        },
      ];

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockRecords)
        .mockResolvedValueOnce([{ count: 2 }]);

      // when
      const result = await service.getRecordsByLocation(
        userId,
        location,
        pagination,
        sortOrder,
      );

      // then
      expect(result.records[0].publicId).toBe('rec_40');
      expect(result.records[1].publicId).toBe('rec_41');
    });
  });

  describe('getAllRecords', () => {
    test('사용자의 모든 레코드를 조회하고 총 개수와 함께 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {};
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      const mockRecords = [
        {
          id: 50n,
          publicId: 'rec_50',
          title: 'Record 1',
          content: 'Content 1',
          locationName: 'Location 1',
          locationAddress: 'Address 1',
          isFavorite: false,
          connectionsCount: 0,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          id: 51n,
          publicId: 'rec_51',
          title: 'Record 2',
          content: 'Content 2',
          locationName: 'Location 2',
          locationAddress: 'Address 2',
          isFavorite: true,
          connectionsCount: 5,
          createdAt: new Date('2024-01-16T10:00:00Z'),
          updatedAt: new Date('2024-01-16T10:00:00Z'),
        },
      ];

      mockPrismaService.record.findMany.mockResolvedValue(mockRecords);
      mockPrismaService.record.count.mockResolvedValue(2);

      // when
      const result = await service.getAllRecords(
        userId,
        filters,
        pagination,
        sortOrder,
      );

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          id: true,
          publicId: true,
          title: true,
          content: true,
          locationName: true,
          locationAddress: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
          connectionsCount: true,
        },
        orderBy: { createdAt: sortOrder },
        skip: 0,
        take: 10,
      });

      expect(result.records).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    test('시작 날짜 필터가 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {
        startDate: new Date('2024-01-15T00:00:00Z'),
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      await service.getAllRecords(userId, filters, pagination, sortOrder);

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            createdAt: { gte: filters.startDate },
          }),
        }),
      );
    });

    test('종료 날짜 필터가 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-31T23:59:59Z'),
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      await service.getAllRecords(userId, filters, pagination, sortOrder);

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            createdAt: {
              gte: filters.startDate,
              lt: filters.endDate,
            },
          }),
        }),
      );
    });

    test('태그 ID 필터가 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {
        tagIds: [10n, 11n, 12n],
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      await service.getAllRecords(userId, filters, pagination, sortOrder);

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            tags: { some: { tagId: { in: [10n, 11n, 12n] } } },
          }),
        }),
      );
    });

    test('빈 태그 배열은 필터에 적용되지 않아야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {
        tagIds: [],
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      await service.getAllRecords(userId, filters, pagination, sortOrder);

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
        }),
      );
    });

    test('모든 필터가 동시에 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-31T23:59:59Z'),
        tagIds: [10n, 11n],
      };
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'asc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      await service.getAllRecords(userId, filters, pagination, sortOrder);

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            createdAt: {
              gte: filters.startDate,
              lt: filters.endDate,
            },
            tags: { some: { tagId: { in: [10n, 11n] } } },
          },
        }),
      );
    });

    test('페이지네이션이 적용되어야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {};
      const pagination = { limit: 20, offset: 40 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(100);

      // when
      const result = await service.getAllRecords(
        userId,
        filters,
        pagination,
        sortOrder,
      );

      // then
      expect(mockPrismaService.record.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        }),
      );
      expect(result.totalCount).toBe(100);
    });

    test('레코드가 없으면 빈 배열과 0개를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const filters = {};
      const pagination = { limit: 10, offset: 0 };
      const sortOrder = 'desc' as const;

      mockPrismaService.record.findMany.mockResolvedValue([]);
      mockPrismaService.record.count.mockResolvedValue(0);

      // when
      const result = await service.getAllRecords(
        userId,
        filters,
        pagination,
        sortOrder,
      );

      // then
      expect(result.records).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});
