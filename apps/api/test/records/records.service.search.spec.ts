import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from '@/records/records.service';
import { RecordSearchService } from '@/records/records-search.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MapsService } from '@/maps/maps.service';
import { OutboxService } from '@/outbox/outbox.service';
import { ImageProcessingService } from '@/records/services/image-processing.service';
import { ObjectStorageService } from '@/records/services/object-storage.service';
import { UsersService } from '@/users/users.service';
import { SearchRecordsDto } from '@/records/dto/search-records.dto';

describe('RecordsService - searchRecords', () => {
  let service: RecordsService;

  const mockRecordSearchService = {
    search: jest.fn(),
  };

  const mockPrismaService = {};
  const mockMapsService = {};
  const mockOutboxService = {};
  const mockImageProcessingService = {};
  const mockObjectStorageService = {};
  const mockUsersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: RecordSearchService, useValue: mockRecordSearchService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MapsService, useValue: mockMapsService },
        { provide: OutboxService, useValue: mockOutboxService },
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
        },
        { provide: ObjectStorageService, useValue: mockObjectStorageService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    jest.clearAllMocks();
  });

  test('검색 결과를 SearchRecordListResponseDto 형식으로 올바르게 변환해야 한다', async () => {
    // given
    const userId = 1n;
    const dto: SearchRecordsDto = {
      keyword: 'cafe',
      hasImage: false,
      isFavorite: false,
      size: 2,
    };

    const mockEsResult = {
      hits: {
        total: { value: 10, relation: 'eq' },
        hits: [
          {
            _source: {
              publicId: 'rec_1',
              title: 'First Cafe',
              createdAt: '2024-01-01T00:00:00Z',
              connectionsCount: 5,
              tags: ['coffee'],
              isFavorite: true,
            },
            sort: [1704067200000, 'rec_1'],
          },
          {
            _source: {
              publicId: 'rec_2',
              title: 'Second Cafe',
              createdAt: '2024-01-02T00:00:00Z',
              connectionsCount: 2,
              tags: ['bread'],
              isFavorite: false,
            },
            sort: [1704153600000, 'rec_2'],
          },
        ],
      },
    };

    mockRecordSearchService.search.mockResolvedValue(mockEsResult);

    // when
    const result = await service.searchRecords(userId, dto);

    // then
    expect(result.records).toHaveLength(2);
    expect(result.records[0].recordId).toBe('rec_1');
    expect(result.records[1].title).toBe('Second Cafe');

    expect(result.pagination.totalCount).toBe(10);
    expect(result.pagination.hasMore).toBe(true);

    const expectedCursor = Buffer.from(
      JSON.stringify([1704153600000, 'rec_2']),
    ).toString('base64');
    expect(result.pagination.nextCursor).toBe(expectedCursor);

    expect(mockRecordSearchService.search).toHaveBeenCalledWith(userId, dto);
  });

  test('검색 결과가 size보다 작으면 hasMore는 false여야 한다', async () => {
    // given
    const userId = 1n;
    const dto: SearchRecordsDto = {
      keyword: 'only_one',
      hasImage: false,
      isFavorite: false,
      size: 10,
    };

    mockRecordSearchService.search.mockResolvedValue({
      hits: {
        total: 5,
        hits: [{ _source: { publicId: 'one' }, sort: [123] }],
      },
    });

    // when
    const result = await service.searchRecords(userId, dto);

    // then
    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.totalCount).toBe(5);
  });

  test('결과가 없을 경우 빈 배열과 null 커서를 반환해야 한다', async () => {
    // given
    const userId = 1n;
    const dto: SearchRecordsDto = {
      keyword: 'nothing',
      hasImage: false,
      isFavorite: false,
    };

    mockRecordSearchService.search.mockResolvedValue({
      hits: {
        total: { value: 0 },
        hits: [],
      },
    });

    // when
    const result = await service.searchRecords(userId, dto);

    // then
    expect(result.records).toEqual([]);
    expect(result.pagination.nextCursor).toBeNull();
    expect(result.pagination.hasMore).toBe(false);
  });

  describe('exception handling', () => {
    test('검색 엔진(RecordSearchService)에서 에러가 발생하면 그대로 예외를 던져야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'error',
        hasImage: false,
        isFavorite: false,
      };
      const externalError = new Error('Elasticsearch Connection Failed');

      mockRecordSearchService.search.mockRejectedValue(externalError);

      // when & then
      await expect(service.searchRecords(userId, dto)).rejects.toThrow(
        'Elasticsearch Connection Failed',
      );
    });

    test('검색 결과 데이터(source)가 손상되어 있을 경우에 대한 예외 처리', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'broken_data',
        hasImage: false,
        isFavorite: false,
      };

      const brokenResult = {
        hits: {
          total: 1,
          hits: [
            {
              // _source가 없는 경우
              sort: [123],
            },
          ],
        },
      };

      mockRecordSearchService.search.mockResolvedValue(brokenResult);

      // when & then
      await expect(service.searchRecords(userId, dto)).rejects.toThrow();
    });

    test('토큰(cursor) 생성 중 오류가 발생하면 예외를 던져야 한다', async () => {
      // given
      const userId = 1n;
      const dto: SearchRecordsDto = {
        keyword: 'cursor_error',
        hasImage: false,
        isFavorite: false,
        size: 1,
      };

      const resultWithoutSort = {
        hits: {
          total: 1,
          hits: [
            {
              _source: { publicId: 'rec_1', title: 'test' },
            },
          ],
        },
      };

      mockRecordSearchService.search.mockResolvedValue(resultWithoutSort);

      // when & then
      await expect(service.searchRecords(userId, dto)).rejects.toThrow();
    });
  });
});
