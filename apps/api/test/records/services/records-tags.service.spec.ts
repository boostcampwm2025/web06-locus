import { Test, TestingModule } from '@nestjs/testing';
import { RecordTagsService } from '@/records/services/records-tags.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TagNotFoundException } from '@/tags/exception/tags.exception';

describe('RecordTagsService', () => {
  let service: RecordTagsService;

  const mockPrismaService = {
    tag: {
      findMany: jest.fn(),
    },
    recordTag: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordTagsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecordTagsService>(RecordTagsService);
  });

  describe('createRecordTags', () => {
    test('태그 publicId 목록으로 레코드-태그 관계를 생성하고 RecordTagDto 배열을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = ['tag_1', 'tag_2', 'tag_3'];

      const mockTags = [
        { id: 10n, publicId: 'tag_1', name: '여행' },
        { id: 11n, publicId: 'tag_2', name: '맛집' },
        { id: 12n, publicId: 'tag_3', name: '카페' },
      ];

      const mockTx = {
        tag: {
          findMany: jest.fn().mockResolvedValue(mockTags),
        },
        recordTag: {
          createMany: jest.fn().mockResolvedValue({ count: 3 }),
        },
      } as any;

      // when
      const result = await service.createRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(mockTx.tag.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          publicId: { in: tagPublicIds },
        },
        select: {
          id: true,
          publicId: true,
          name: true,
        },
      });

      expect(mockTx.recordTag.createMany).toHaveBeenCalledWith({
        data: [
          { recordId: 100n, tagId: 10n },
          { recordId: 100n, tagId: 11n },
          { recordId: 100n, tagId: 12n },
        ],
      });

      expect(result).toEqual([
        { publicId: 'tag_1', name: '여행' },
        { publicId: 'tag_2', name: '맛집' },
        { publicId: 'tag_3', name: '카페' },
      ]);
    });

    test('tagPublicIds가 빈 배열이면 빈 배열을 반환하고 DB 조회를 하지 않아야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds: string[] = [];

      const mockTx = {
        tag: {
          findMany: jest.fn(),
        },
        recordTag: {
          createMany: jest.fn(),
        },
      } as any;

      // when
      const result = await service.createRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(result).toEqual([]);
      expect(mockTx.tag.findMany).not.toHaveBeenCalled();
      expect(mockTx.recordTag.createMany).not.toHaveBeenCalled();
    });

    test('tagPublicIds가 undefined이면 빈 배열을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = undefined;

      const mockTx = {
        tag: {
          findMany: jest.fn(),
        },
        recordTag: {
          createMany: jest.fn(),
        },
      } as any;

      // when
      const result = await service.createRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(result).toEqual([]);
      expect(mockTx.tag.findMany).not.toHaveBeenCalled();
    });

    test('존재하지 않는 태그가 포함되어 있으면 TagNotFoundException을 던져야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = ['tag_1', 'tag_2', 'tag_not_exist'];

      const mockTags = [
        { id: 10n, publicId: 'tag_1', name: '여행' },
        { id: 11n, publicId: 'tag_2', name: '맛집' },
      ];

      const mockTx = {
        tag: {
          findMany: jest.fn().mockResolvedValue(mockTags),
        },
        recordTag: {
          createMany: jest.fn(),
        },
      } as any;

      // when & then
      await expect(
        service.createRecordTags(mockTx, userId, recordId, tagPublicIds),
      ).rejects.toThrow(TagNotFoundException);

      await expect(
        service.createRecordTags(mockTx, userId, recordId, tagPublicIds),
      ).rejects.toThrow('태그를 찾을 수 없습니다.');

      expect(mockTx.recordTag.createMany).not.toHaveBeenCalled();
    });

    test('다른 사용자의 태그는 찾지 못해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = ['tag_1', 'tag_2'];

      // 다른 사용자의 태그이므로 찾을 수 없음
      const mockTags: any[] = [];

      const mockTx = {
        tag: {
          findMany: jest.fn().mockResolvedValue(mockTags),
        },
        recordTag: {
          createMany: jest.fn(),
        },
      } as any;

      // when & then
      await expect(
        service.createRecordTags(mockTx, userId, recordId, tagPublicIds),
      ).rejects.toThrow(TagNotFoundException);
    });
  });

  describe('getRecordTags', () => {
    test('레코드 ID로 연결된 태그 목록을 조회해야 한다', async () => {
      // given
      const recordId = 100n;

      const mockRecordTags = [
        { tag: { publicId: 'tag_1', name: '여행' } },
        { tag: { publicId: 'tag_2', name: '맛집' } },
        { tag: { publicId: 'tag_3', name: '카페' } },
      ];

      mockPrismaService.recordTag.findMany.mockResolvedValue(mockRecordTags);

      // when
      const result = await service.getRecordTags(recordId);

      // then
      expect(mockPrismaService.recordTag.findMany).toHaveBeenCalledWith({
        where: { recordId },
        select: {
          tag: {
            select: {
              publicId: true,
              name: true,
            },
          },
        },
      });

      expect(result).toEqual([
        { publicId: 'tag_1', name: '여행' },
        { publicId: 'tag_2', name: '맛집' },
        { publicId: 'tag_3', name: '카페' },
      ]);
    });

    test('태그가 없는 레코드는 빈 배열을 반환해야 한다', async () => {
      // given
      const recordId = 100n;

      mockPrismaService.recordTag.findMany.mockResolvedValue([]);

      // when
      const result = await service.getRecordTags(recordId);

      // then
      expect(result).toEqual([]);
    });

    test('DB 조회 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const recordId = 100n;
      const error = new Error('DB query failed');

      mockPrismaService.recordTag.findMany.mockRejectedValue(error);

      // when & then
      await expect(service.getRecordTags(recordId)).rejects.toThrow(
        'DB query failed',
      );
    });
  });

  describe('getTagsByRecordIds', () => {
    test('여러 레코드 ID로 태그들을 조회하고 recordId별로 그룹화하여 반환해야 한다', async () => {
      // given
      const recordIds = [100n, 200n, 300n];

      const mockRecordTags = [
        {
          recordId: 100n,
          tag: { publicId: 'tag_1', name: '여행' },
        },
        {
          recordId: 100n,
          tag: { publicId: 'tag_2', name: '맛집' },
        },
        {
          recordId: 200n,
          tag: { publicId: 'tag_3', name: '카페' },
        },
        {
          recordId: 300n,
          tag: { publicId: 'tag_1', name: '여행' },
        },
      ];

      mockPrismaService.recordTag.findMany.mockResolvedValue(mockRecordTags);

      // when
      const result = await service.getTagsByRecordIds(recordIds);

      // then
      expect(mockPrismaService.recordTag.findMany).toHaveBeenCalledWith({
        where: { recordId: { in: recordIds } },
        select: {
          recordId: true,
          tag: { select: { publicId: true, name: true } },
        },
      });

      expect(result.size).toBe(3);
      expect(result.get(100n)).toEqual([
        { publicId: 'tag_1', name: '여행' },
        { publicId: 'tag_2', name: '맛집' },
      ]);
      expect(result.get(200n)).toEqual([{ publicId: 'tag_3', name: '카페' }]);
      expect(result.get(300n)).toEqual([{ publicId: 'tag_1', name: '여행' }]);
    });

    test('빈 배열이 전달되면 빈 Map을 반환하고 DB 조회를 하지 않아야 한다', async () => {
      // given
      const recordIds: bigint[] = [];

      // when
      const result = await service.getTagsByRecordIds(recordIds);

      // then
      expect(result.size).toBe(0);
      expect(mockPrismaService.recordTag.findMany).not.toHaveBeenCalled();
    });

    test('태그가 없는 레코드는 Map에 포함되지 않아야 한다', async () => {
      // given
      const recordIds = [100n, 200n];

      mockPrismaService.recordTag.findMany.mockResolvedValue([]);

      // when
      const result = await service.getTagsByRecordIds(recordIds);

      // then
      expect(result.size).toBe(0);
    });

    test('일부 레코드만 태그가 있어도 정상적으로 처리해야 한다', async () => {
      // given
      const recordIds = [100n, 200n, 300n];

      const mockRecordTags = [
        {
          recordId: 100n,
          tag: { publicId: 'tag_1', name: '여행' },
        },
      ];

      mockPrismaService.recordTag.findMany.mockResolvedValue(mockRecordTags);

      // when
      const result = await service.getTagsByRecordIds(recordIds);

      // then
      expect(result.size).toBe(1);
      expect(result.get(100n)).toEqual([{ publicId: 'tag_1', name: '여행' }]);
      expect(result.get(200n)).toBeUndefined();
      expect(result.get(300n)).toBeUndefined();
    });
  });

  describe('updateRecordTags', () => {
    test('기존 태그를 모두 삭제하고 새로운 태그들을 생성해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = ['tag_1', 'tag_2'];

      const mockTags = [
        { id: 10n, publicId: 'tag_1', name: '여행' },
        { id: 11n, publicId: 'tag_2', name: '맛집' },
      ];

      const mockTx = {
        recordTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
        tag: {
          findMany: jest.fn().mockResolvedValue(mockTags),
        },
      } as any;

      // when
      const result = await service.updateRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(mockTx.recordTag.deleteMany).toHaveBeenCalledWith({
        where: { recordId },
      });
      expect(mockTx.recordTag.deleteMany).toHaveBeenCalledTimes(1);

      expect(mockTx.tag.findMany).toHaveBeenCalledTimes(1);
      expect(mockTx.recordTag.createMany).toHaveBeenCalledTimes(1);

      expect(result).toEqual([
        { publicId: 'tag_1', name: '여행' },
        { publicId: 'tag_2', name: '맛집' },
      ]);
    });

    test('tagPublicIds가 빈 배열이면 기존 태그만 삭제하고 빈 배열을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds: string[] = [];

      const mockTx = {
        recordTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
          createMany: jest.fn(),
        },
        tag: {
          findMany: jest.fn(),
        },
      } as any;

      // when
      const result = await service.updateRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(mockTx.recordTag.deleteMany).toHaveBeenCalledWith({
        where: { recordId },
      });
      expect(result).toEqual([]);
      expect(mockTx.tag.findMany).not.toHaveBeenCalled();
      expect(mockTx.recordTag.createMany).not.toHaveBeenCalled();
    });

    test('tagPublicIds가 undefined이면 기존 태그만 삭제하고 빈 배열을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = undefined;

      const mockTx = {
        recordTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          createMany: jest.fn(),
        },
        tag: {
          findMany: jest.fn(),
        },
      } as any;

      // when
      const result = await service.updateRecordTags(
        mockTx,
        userId,
        recordId,
        tagPublicIds,
      );

      // then
      expect(mockTx.recordTag.deleteMany).toHaveBeenCalledWith({
        where: { recordId },
      });
      expect(result).toEqual([]);
    });

    test('새로운 태그 생성 중 에러가 발생하면 예외를 던져야 한다', async () => {
      // given
      const userId = 1n;
      const recordId = 100n;
      const tagPublicIds = ['tag_not_exist'];

      const mockTx = {
        recordTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn(),
        },
        tag: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as any;

      // when & then
      await expect(
        service.updateRecordTags(mockTx, userId, recordId, tagPublicIds),
      ).rejects.toThrow(TagNotFoundException);
    });
  });

  describe('convertTagPublicIdsToIds', () => {
    test('태그 publicId 목록을 id 목록으로 변환해야 한다', async () => {
      // given
      const userId = 1n;
      const tagPublicIds = ['tag_1', 'tag_2', 'tag_3'];

      const mockTags = [
        { id: 10n, publicId: 'tag_1' },
        { id: 11n, publicId: 'tag_2' },
        { id: 12n, publicId: 'tag_3' },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      // when
      const result = await service.convertTagPublicIdsToIds(
        userId,
        tagPublicIds,
      );

      // then
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: { userId, publicId: { in: tagPublicIds } },
        select: { id: true, publicId: true },
      });

      expect(result).toEqual([10n, 11n, 12n]);
    });

    test('tagPublicIds가 빈 배열이면 undefined를 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const tagPublicIds: string[] = [];

      // when
      const result = await service.convertTagPublicIdsToIds(
        userId,
        tagPublicIds,
      );

      // then
      expect(result).toBeUndefined();
      expect(mockPrismaService.tag.findMany).not.toHaveBeenCalled();
    });

    test('일부 태그만 존재하는 경우 존재하는 태그의 id만 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const tagPublicIds = ['tag_1', 'tag_2', 'tag_not_exist'];

      const mockTags = [
        { id: 10n, publicId: 'tag_1' },
        { id: 11n, publicId: 'tag_2' },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      // when
      const result = await service.convertTagPublicIdsToIds(
        userId,
        tagPublicIds,
      );

      // then
      expect(result).toEqual([10n, 11n]);
    });

    test('어떤 태그도 찾지 못하면 빈 배열을 반환해야 한다', async () => {
      // given
      const userId = 1n;
      const tagPublicIds = ['tag_not_exist_1', 'tag_not_exist_2'];

      mockPrismaService.tag.findMany.mockResolvedValue([]);

      // when
      const result = await service.convertTagPublicIdsToIds(
        userId,
        tagPublicIds,
      );

      // then
      expect(result).toEqual([]);
    });

    test('다른 사용자의 태그는 변환되지 않아야 한다', async () => {
      // given
      const userId = 1n;
      const tagPublicIds = ['tag_1', 'tag_2'];

      // 다른 사용자의 태그이므로 빈 배열 반환
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      // when
      const result = await service.convertTagPublicIdsToIds(
        userId,
        tagPublicIds,
      );

      // then
      expect(result).toEqual([]);
    });
  });
});
