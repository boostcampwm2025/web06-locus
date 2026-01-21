// tags.service.spec.ts
import { TagsService } from '@/tags/tags.services';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InvalidTagNameException,
  SystemTagNotDeletableException,
  TagAlreadyExistsException,
  TagForbiddenException,
  TagNotFoundException,
} from '@/tags/exception/tags.exception';

interface PrismaMock {
  tag: {
    create: jest.Mock;
    findFirst: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
  };
}

describe('TagsService - createOne', () => {
  let service: TagsService;
  let prismaMock: PrismaMock;

  beforeEach(() => {
    prismaMock = {
      tag: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    service = new TagsService(prismaMock as unknown as PrismaService);
    jest.clearAllMocks();
  });

  test('태그 이름이 빈 문자열이면 InvalidTagNameException을 던지고 DB 조회/생성은 수행하지 않는다', async () => {
    await expect(service.createOne(1n, { name: '' })).rejects.toBeInstanceOf(
      InvalidTagNameException,
    );

    expect(prismaMock.tag.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.tag.create).not.toHaveBeenCalled();
  });

  test('태그 이름이 5자를 초과하면 InvalidTagNameException을 던지고 DB 조회/생성은 수행하지 않는다', async () => {
    await expect(
      service.createOne(1n, { name: '123456' }),
    ).rejects.toBeInstanceOf(InvalidTagNameException);

    expect(prismaMock.tag.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.tag.create).not.toHaveBeenCalled();
  });

  test('이미 동일한 이름의 태그가 존재하면 TagAlreadyExistsException을 던지고 생성은 수행하지 않는다', async () => {
    const userId = 1n;
    const name = '여행';

    prismaMock.tag.findFirst.mockResolvedValueOnce({
      id: 99n,
      name,
      userId,
      isSystem: false,
    });

    await expect(service.createOne(userId, { name })).rejects.toBeInstanceOf(
      TagAlreadyExistsException,
    );

    expect(prismaMock.tag.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaMock.tag.findFirst).toHaveBeenCalledWith({
      where: { name },
    });
    expect(prismaMock.tag.create).not.toHaveBeenCalled();
  });

  test('유효한 태그 이름이고 중복이 없으면 태그를 생성하고 id/name/isSystem을 반환한다', async () => {
    const userId = 1n;
    const name = '여행';

    prismaMock.tag.findFirst.mockResolvedValueOnce(null);
    prismaMock.tag.create.mockResolvedValueOnce({
      id: 10n,
      name,
      isSystem: false,
    });

    const result = await service.createOne(userId, { name });

    expect(prismaMock.tag.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaMock.tag.findFirst).toHaveBeenCalledWith({
      where: { name },
    });

    expect(prismaMock.tag.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.tag.create).toHaveBeenCalledWith({
      data: { name, isSystem: false, userId },
      select: { publicId: true, name: true, isSystem: true },
    });

    expect(result).toEqual({ id: 10n, name, isSystem: false });
  });

  describe('TagsService - deleteOne', () => {
    test('publicId에 해당하는 태그가 없으면 TagNotFoundException을 던지고 delete를 호출하지 않는다', async () => {
      prismaMock.tag.findFirst.mockResolvedValueOnce(null);

      await expect(service.deleteOne(1n, 'tag_pub')).rejects.toBeInstanceOf(
        TagNotFoundException,
      );

      expect(prismaMock.tag.delete).not.toHaveBeenCalled();
    });

    test('태그는 존재하지만 userId가 다르면 TagForbiddenException을 던지고 delete를 호출하지 않는다', async () => {
      prismaMock.tag.findFirst.mockResolvedValueOnce({
        id: 10n,
        publicId: 'tag_pub',
        userId: 2n,
        isSystem: false,
        name: '여행',
      });

      await expect(service.deleteOne(1n, 'tag_pub')).rejects.toBeInstanceOf(
        TagForbiddenException,
      );

      expect(prismaMock.tag.delete).not.toHaveBeenCalled();
    });

    test('태그가 시스템 태그이면 SystemTagNotDeletableException을 던지고 delete를 호출하지 않는다', async () => {
      prismaMock.tag.findFirst.mockResolvedValueOnce({
        id: 10n,
        publicId: 'tag_pub',
        userId: 1n,
        isSystem: true,
        name: '시스템',
      });

      await expect(service.deleteOne(1n, 'tag_pub')).rejects.toBeInstanceOf(
        SystemTagNotDeletableException,
      );

      expect(prismaMock.tag.delete).not.toHaveBeenCalled();
    });

    test('태그가 존재하고 소유자이며 시스템 태그가 아니면 delete를 호출하고 publicId를 반환한다', async () => {
      prismaMock.tag.findFirst.mockResolvedValueOnce({
        id: 10n,
        publicId: 'tag_pub',
        userId: 1n,
        isSystem: false,
        name: '여행',
      });

      prismaMock.tag.delete.mockResolvedValueOnce({ publicId: 'tag_pub' });

      const result = await service.deleteOne(1n, 'tag_pub');

      expect(prismaMock.tag.findFirst).toHaveBeenCalledWith({
        where: { publicId: 'tag_pub' },
      });

      expect(prismaMock.tag.delete).toHaveBeenCalledWith({
        where: { id: 10n },
        select: { publicId: true },
      });

      expect(result).toEqual({ publicId: 'tag_pub' });
    });
  });

  describe('TagsService - findAll', () => {
    test('userId로 태그 목록을 조회하면 publicId/isSystem/name만 선택해서 반환한다', async () => {
      const userId = 1n;

      const rows = [
        { publicId: 'tag_a', isSystem: false, name: '여행' },
        { publicId: 'tag_b', isSystem: true, name: '시스템' },
      ];

      prismaMock.tag.findMany.mockResolvedValueOnce(rows);

      const result = await service.findAll(userId);

      expect(prismaMock.tag.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          publicId: true,
          isSystem: true,
          name: true,
        },
      });

      expect(result).toEqual(rows);
    });

    test('태그가 없으면 빈 배열을 반환한다', async () => {
      const userId = 1n;

      prismaMock.tag.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll(userId);

      expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          publicId: true,
          isSystem: true,
          name: true,
        },
      });
      expect(result).toEqual([]);
    });
  });
});
