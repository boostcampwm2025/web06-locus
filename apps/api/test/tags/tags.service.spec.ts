// tags.service.spec.ts
import { TagsService } from '@/tags/tags.services';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InvalidTagNameException,
  TagAlreadyExistsException,
} from '@/tags/exception/tags.exception';

interface PrismaMock {
  tag: {
    create: jest.Mock;
    findFirst: jest.Mock;
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
      select: { id: true, name: true, isSystem: true },
    });

    expect(result).toEqual({ id: 10n, name, isSystem: false });
  });
});
