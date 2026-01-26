import { RecordsService } from '@/records/records.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MapsService } from '@/maps/maps.service';
import { RecordNotFoundException } from '@/records/exceptions/record.exceptions';
import { OutboxService } from '@/outbox/outbox.service';
import { ImageProcessingService } from '@/records/services/image-processing.service';
import { ObjectStorageService } from '@/records/services/object-storage.service';
import { UsersService } from '@/users/users.service';
import { RecordTagsService } from '@/records/record-tags.service';
import { TagsService } from '@/tags/tags.services';
interface PrismaMock {
  record: { findUnique: jest.Mock };
  $queryRaw: jest.Mock;
}

interface ReverseGeocodingMock {
  getAddressFromCoordinates: jest.Mock;
}

interface OutboxMock {
  publish: jest.Mock;
}

interface ImageProcessingServiceMock {
  process: jest.Mock;
}
interface ObjectStorageServiceMock {
  deleteImages: jest.Mock;
  uploadRecordImages: jest.Mock;
}
interface UsersServiceMock {
  findById: jest.Mock;
}

interface RecordTagsServiceMock {
  createRecordTags: jest.Mock;
}

interface TagsServiceMock {
  findManyByRecordIds: jest.Mock;
}

describe('RecordsService - getGraph', () => {
  let service: RecordsService;
  let prismaMock: PrismaMock;
  let reverseGeocodingMock: ReverseGeocodingMock;
  let outboxServiceMock: OutboxMock;
  let imageProcessingServiceMock: ImageProcessingServiceMock;
  let objectStorageServiceMock: ObjectStorageServiceMock;
  let usersServiceMock: UsersServiceMock;
  let recordTagsServiceMock: RecordTagsServiceMock;
  let tagsServiceMock: TagsServiceMock;

  beforeEach(() => {
    prismaMock = {
      record: { findUnique: jest.fn() },
      $queryRaw: jest.fn(),
    };

    reverseGeocodingMock = {
      getAddressFromCoordinates: jest.fn(),
    };

    outboxServiceMock = {
      publish: jest.fn(),
    };

    imageProcessingServiceMock = {
      process: jest.fn(),
    };

    objectStorageServiceMock = {
      deleteImages: jest.fn(),
      uploadRecordImages: jest.fn(),
    };

    usersServiceMock = {
      findById: jest.fn(),
    };

    recordTagsServiceMock = {
      createRecordTags: jest.fn(),
    };

    tagsServiceMock = {
      findManyByRecordIds: jest.fn(),
    };

    service = new RecordsService(
      prismaMock as unknown as PrismaService,
      reverseGeocodingMock as unknown as MapsService,
      outboxServiceMock as unknown as OutboxService,
      imageProcessingServiceMock as unknown as ImageProcessingService,
      objectStorageServiceMock as unknown as ObjectStorageService,
      usersServiceMock as unknown as UsersService,
      recordTagsServiceMock as unknown as RecordTagsService,
      tagsServiceMock as unknown as TagsService,
    );

    jest.clearAllMocks();
  });

  test('시작 레코드 publicId로 id를 조회하고, RAW SQL 결과를 nodes/edges로 변환하여 meta와 함께 반환한다', async () => {
    // given
    const startRecordPublicId = 'rec_start';
    const userId = 7n;

    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 10n });

    const rows = [
      {
        row_type: 'node',
        node_public_id: 'rec_a',
        latitude: 37.1,
        longitude: 127.1,
        from_public_id: null,
        to_public_id: null,
      },
      {
        row_type: 'node',
        node_public_id: 'rec_b',
        latitude: 37.2,
        longitude: 127.2,
        from_public_id: null,
        to_public_id: null,
      },
      {
        row_type: 'edge',
        node_public_id: null,
        latitude: null,
        longitude: null,
        from_public_id: 'rec_a',
        to_public_id: 'rec_b',
      },
    ];

    prismaMock.$queryRaw.mockResolvedValueOnce(rows);

    // when
    const result = await service.getGraph(startRecordPublicId, userId);

    // then: recordId 조회
    expect(prismaMock.record.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.record.findUnique).toHaveBeenCalledWith({
      where: { publicId: startRecordPublicId },
      select: { id: true },
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
      expect.anything(), // Prisma.Sql 객체
    );

    // then: 변환 결과
    expect(result).toEqual({
      nodes: [
        { publicId: 'rec_a', location: { latitude: 37.1, longitude: 127.1 } },
        { publicId: 'rec_b', location: { latitude: 37.2, longitude: 127.2 } },
      ],
      edges: [{ fromRecordPublicId: 'rec_a', toRecordPublicId: 'rec_b' }],
      meta: {
        start: startRecordPublicId,
        nodeCount: 2,
        edgeCount: 1,
        truncated: false,
      },
    });
  });

  test('시작 레코드 publicId가 존재하지 않으면 RecordNotFoundException을 던지고 RAW SQL은 호출하지 않는다', async () => {
    // given
    prismaMock.record.findUnique.mockResolvedValueOnce(null);

    // when & then
    await expect(service.getGraph('rec_missing', 7n)).rejects.toBeInstanceOf(
      RecordNotFoundException,
    );

    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  test('RAW SQL 결과가 빈 배열이면 nodes/edges는 빈 배열이고 meta 카운트도 0으로 반환한다', async () => {
    // given
    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 10n });
    prismaMock.$queryRaw.mockResolvedValueOnce([]);

    // when
    const result = await service.getGraph('rec_start', 7n);

    // then
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.meta).toEqual({
      start: 'rec_start',
      nodeCount: 0,
      edgeCount: 0,
      truncated: false,
    });
  });

  test('ROW 타입이 node가 아니면 edge로 취급하여 from/to publicId를 edges에 추가한다', async () => {
    // given
    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 10n });

    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        row_type: 'edge',
        node_public_id: null,
        latitude: null,
        longitude: null,
        from_public_id: 'rec_x',
        to_public_id: 'rec_y',
      },
    ]);

    // when
    const result = await service.getGraph('rec_start', 7n);

    // then
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([
      { fromRecordPublicId: 'rec_x', toRecordPublicId: 'rec_y' },
    ]);
    expect(result.meta.edgeCount).toBe(1);
    expect(result.meta.nodeCount).toBe(0);
  });
});

describe('RecordsService - getGraphNeighborDetail', () => {
  let service: RecordsService;
  let prismaMock: PrismaMock;
  let reverseGeocodingMock: ReverseGeocodingMock;
  let outboxServiceMock: OutboxMock;
  let imageProcessingServiceMock: ImageProcessingServiceMock;
  let objectStorageServiceMock: ObjectStorageServiceMock;
  let usersServiceMock: UsersServiceMock;
  let recordTagsServiceMock: RecordTagsServiceMock;
  let tagsServiceMock: TagsServiceMock;

  beforeEach(() => {
    prismaMock = {
      record: { findUnique: jest.fn() },
      $queryRaw: jest.fn(),
    };

    reverseGeocodingMock = {
      getAddressFromCoordinates: jest.fn(),
    };

    outboxServiceMock = {
      publish: jest.fn(),
    };

    imageProcessingServiceMock = {
      process: jest.fn(),
    };

    objectStorageServiceMock = {
      deleteImages: jest.fn(),
      uploadRecordImages: jest.fn(),
    };

    usersServiceMock = {
      findById: jest.fn(),
    };

    recordTagsServiceMock = {
      createRecordTags: jest.fn(),
    };

    tagsServiceMock = {
      findManyByRecordIds: jest.fn(),
    };

    service = new RecordsService(
      prismaMock as unknown as PrismaService,
      reverseGeocodingMock as unknown as MapsService,
      outboxServiceMock as unknown as OutboxService,
      imageProcessingServiceMock as unknown as ImageProcessingService,
      objectStorageServiceMock as unknown as ObjectStorageService,
      usersServiceMock as unknown as UsersService,
      recordTagsServiceMock as unknown as RecordTagsService,
      tagsServiceMock as unknown as TagsService,
    );

    jest.clearAllMocks();
  });

  test('인접 레코드를 조회하고 태그/위치 정보를 포함해 반환한다', async () => {
    const startRecordPublicId = 'rec_start';
    const userId = 7n;

    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 100n });

    const records = [
      {
        id: 11n,
        recordPublicId: 'rec_a',
        title: '기록 A',
        latitude: 37.1,
        longitude: 127.1,
        locationName: '장소 A',
        locationAddress: '주소 A',
        createdAt: new Date('2024-01-14T10:20:00Z'),
        updatedAt: new Date('2024-01-14T12:20:00Z'),
      },
      {
        id: 12n,
        recordPublicId: 'rec_b',
        title: '기록 B',
        latitude: 37.2,
        longitude: 127.2,
        locationName: '장소 B',
        locationAddress: '주소 B',
        createdAt: new Date('2024-02-14T10:20:00Z'),
        updatedAt: new Date('2024-02-14T12:20:00Z'),
      },
    ];

    prismaMock.$queryRaw.mockResolvedValueOnce(records);
    tagsServiceMock.findManyByRecordIds.mockResolvedValueOnce([
      { recordId: 11n, tagPublicId: 'tag_a', tagName: '태그 A' },
      { recordId: 11n, tagPublicId: 'tag_b', tagName: '태그 B' },
    ]);

    const result = await service.getGraphNeighborDetail(
      startRecordPublicId,
      userId,
    );

    expect(prismaMock.record.findUnique).toHaveBeenCalledWith({
      where: { publicId: startRecordPublicId },
      select: { id: true },
    });
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tagsServiceMock.findManyByRecordIds).toHaveBeenCalledWith(userId, [
      11n,
      12n,
    ]);

    expect(result).toEqual([
      {
        publicId: 'rec_a',
        title: '기록 A',
        location: {
          latitude: 37.1,
          longitude: 127.1,
          name: '장소 A',
          address: '주소 A',
        },
        tags: [
          { publicId: 'tag_a', name: '태그 A' },
          { publicId: 'tag_b', name: '태그 B' },
        ],
        createdAt: '2024-01-14T10:20:00.000Z',
        updatedAt: '2024-01-14T12:20:00.000Z',
      },
      {
        publicId: 'rec_b',
        title: '기록 B',
        location: {
          latitude: 37.2,
          longitude: 127.2,
          name: '장소 B',
          address: '주소 B',
        },
        tags: [],
        createdAt: '2024-02-14T10:20:00.000Z',
        updatedAt: '2024-02-14T12:20:00.000Z',
      },
    ]);
  });

  test('인접 레코드가 없으면 빈 배열을 반환하고 태그 조회는 호출하지 않는다', async () => {
    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 100n });
    prismaMock.$queryRaw.mockResolvedValueOnce([]);

    const result = await service.getGraphNeighborDetail('rec_start', 7n);

    expect(result).toEqual([]);
    expect(tagsServiceMock.findManyByRecordIds).not.toHaveBeenCalled();
  });

  test('시작 레코드 publicId가 존재하지 않으면 RecordNotFoundException을 던진다', async () => {
    prismaMock.record.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.getGraphNeighborDetail('rec_missing', 7n),
    ).rejects.toBeInstanceOf(RecordNotFoundException);

    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
    expect(tagsServiceMock.findManyByRecordIds).not.toHaveBeenCalled();
  });
});
