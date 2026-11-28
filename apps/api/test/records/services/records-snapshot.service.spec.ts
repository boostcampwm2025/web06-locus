import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import {
  RecordSnapshotRow,
  RecordSnapshotService,
  toRecordSyncPayload,
} from '../../../src/records/services/records-snapshot.service';

describe('RecordSnapshotService', () => {
  let service: RecordSnapshotService;

  const mockTx = {
    record: {
      findUniqueOrThrow: jest.fn(),
    },
  };
  const tx = mockTx as unknown as Prisma.TransactionClient;

  const buildRow = (
    overrides: Partial<RecordSnapshotRow> = {},
  ): RecordSnapshotRow => ({
    id: 100n,
    publicId: 'pub-100',
    userId: 7n,
    title: '제목',
    content: '내용',
    isFavorite: true,
    locationName: '강남역',
    locationAddress: '서울 강남구',
    connectionsCount: 3,
    createdAt: new Date('2026-01-02T03:04:05.000Z'),
    tags: [{ tag: { name: '맛집' } }, { tag: { name: '데이트' } }],
    images: [{ thumbnailUrl: 'https://cdn.example.com/thumb.webp' }],
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordSnapshotService],
    }).compile();

    service = module.get(RecordSnapshotService);
  });

  describe('buildSnapshot', () => {
    test('기록 전체 상태를 완전한 스냅샷으로 만들어야 한다', async () => {
      // given
      mockTx.record.findUniqueOrThrow.mockResolvedValue(buildRow());

      // when
      const payload = await service.buildSnapshot(tx, 100n);

      // then
      expect(payload).toEqual({
        recordId: '100',
        publicId: 'pub-100',
        userId: '7',
        title: '제목',
        content: '내용',
        isFavorite: true,
        locationName: '강남역',
        locationAddress: '서울 강남구',
        tags: ['맛집', '데이트'],
        hasImages: true,
        thumbnailImage: 'https://cdn.example.com/thumb.webp',
        connectionsCount: 3,
        createdAt: '2026-01-02T03:04:05.000Z',
      });
    });

    test('connectionsCount를 0으로 고정하지 않고 DB 값을 그대로 담아야 한다', async () => {
      // given: 기록 수정 이벤트가 ES의 연결 수를 0으로 되돌리던 버그의 회귀 방지
      mockTx.record.findUniqueOrThrow.mockResolvedValue(
        buildRow({ connectionsCount: 12 }),
      );

      // when
      const payload = await service.buildSnapshot(tx, 100n);

      // then
      expect(payload.connectionsCount).toBe(12);
    });

    test('같은 트랜잭션에서 기록, 태그, 첫 이미지를 쿼리 한 번으로 읽어야 한다', async () => {
      // given
      mockTx.record.findUniqueOrThrow.mockResolvedValue(buildRow());

      // when
      await service.buildSnapshot(tx, 100n);

      // then
      expect(mockTx.record.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(mockTx.record.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 100n },
        select: expect.objectContaining({
          tags: { select: { tag: { select: { name: true } } } },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { thumbnailUrl: true },
          },
        }),
      });
    });

    test('기록이 없으면 예외를 그대로 전파해 호출 트랜잭션이 롤백되게 해야 한다', async () => {
      // given
      mockTx.record.findUniqueOrThrow.mockRejectedValue(
        new Error('No Record found'),
      );

      // when & then
      await expect(service.buildSnapshot(tx, 999n)).rejects.toThrow(
        'No Record found',
      );
    });
  });

  describe('toRecordSyncPayload', () => {
    test('이미지가 없으면 hasImages=false, thumbnailImage=null 이어야 한다', () => {
      // when
      const payload = toRecordSyncPayload(buildRow({ images: [] }));

      // then
      expect(payload.hasImages).toBe(false);
      expect(payload.thumbnailImage).toBeNull();
    });

    test('썸네일이 아직 없는(처리 중) 이미지는 hasImages=false 이어야 한다', () => {
      // when
      const payload = toRecordSyncPayload(
        buildRow({ images: [{ thumbnailUrl: null }] }),
      );

      // then
      expect(payload.hasImages).toBe(false);
      expect(payload.thumbnailImage).toBeNull();
    });

    test('태그가 없으면 빈 배열이어야 한다', () => {
      // when
      const payload = toRecordSyncPayload(buildRow({ tags: [] }));

      // then
      expect(payload.tags).toEqual([]);
    });

    test('null 가능 필드(content, 위치 이름/주소)를 그대로 유지해야 한다', () => {
      // when
      const payload = toRecordSyncPayload(
        buildRow({
          content: null,
          locationName: null,
          locationAddress: null,
        }),
      );

      // then
      expect(payload.content).toBeNull();
      expect(payload.locationName).toBeNull();
      expect(payload.locationAddress).toBeNull();
    });

    test('bigint ID는 문자열로, 생성 시각은 ISO 문자열로 변환해야 한다', () => {
      // when
      const payload = toRecordSyncPayload(
        buildRow({ id: 9007199254740993n, userId: 42n }),
      );

      // then
      expect(payload.recordId).toBe('9007199254740993');
      expect(payload.userId).toBe('42');
      expect(payload.createdAt).toBe('2026-01-02T03:04:05.000Z');
    });
  });
});
