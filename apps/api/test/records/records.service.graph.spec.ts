import { RecordsService } from '@/records/records.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from '@/records/services/reverse-geocoding.service';
import { RecordNotFoundException } from '@/records/exceptions/record.exceptions';
import { GRAPH_ROWS_SQL } from '@/records/sql/graph.row.sql';

interface PrismaMock {
  record: { findUnique: jest.Mock };
  $queryRawUnsafe: jest.Mock;
}

interface ReverseGeocodingMock {
  getAddressFromCoordinates: jest.Mock;
}

describe('RecordsService - getGraph', () => {
  let service: RecordsService;
  let prismaMock: PrismaMock;
  let reverseGeocodingMock: ReverseGeocodingMock;

  beforeEach(() => {
    prismaMock = {
      record: { findUnique: jest.fn() },
      $queryRawUnsafe: jest.fn(),
    };

    reverseGeocodingMock = {
      getAddressFromCoordinates: jest.fn(),
    };

    service = new RecordsService(
      prismaMock as unknown as PrismaService,
      reverseGeocodingMock as unknown as ReverseGeocodingService,
    );

    jest.clearAllMocks();
  });

  test('시작 레코드 publicId로 id를 조회하고, RAW SQL 결과를 nodes/edges로 변환하여 meta와 함께 반환한다', async () => {
    // given
    const startRecordPublicId = 'rec_start';
    const userId = 7;

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

    prismaMock.$queryRawUnsafe.mockResolvedValueOnce(rows);

    // when
    const result = await service.getGraph(startRecordPublicId, userId);

    // then: recordId 조회
    expect(prismaMock.record.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.record.findUnique).toHaveBeenCalledWith({
      where: { publicId: startRecordPublicId },
      select: { id: true },
    });

    // then: RAW SQL 호출 (쿼리 + 파라미터 검증)
    expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
      GRAPH_ROWS_SQL,
      10n,
      userId,
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
    await expect(service.getGraph('rec_missing', 7)).rejects.toBeInstanceOf(
      RecordNotFoundException,
    );

    expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  test('RAW SQL 결과가 빈 배열이면 nodes/edges는 빈 배열이고 meta 카운트도 0으로 반환한다', async () => {
    // given
    prismaMock.record.findUnique.mockResolvedValueOnce({ id: 10n });
    prismaMock.$queryRawUnsafe.mockResolvedValueOnce([]);

    // when
    const result = await service.getGraph('rec_start', 7);

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

    prismaMock.$queryRawUnsafe.mockResolvedValueOnce([
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
    const result = await service.getGraph('rec_start', 7);

    // then
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([
      { fromRecordPublicId: 'rec_x', toRecordPublicId: 'rec_y' },
    ]);
    expect(result.meta.edgeCount).toBe(1);
    expect(result.meta.nodeCount).toBe(0);
  });
});
