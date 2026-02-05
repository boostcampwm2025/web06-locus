import { ConnectionsService } from '@/connections/connections.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateConnectionRequestDto } from '@/connections/dto/create-connection.request.dto';
import {
  ConnectionAlreadyExistsException,
  SameRecordConnectionNotAllowedException,
} from '@/connections/exceptions/business.exception';
import { RecordNotFoundException } from '@/records/exceptions/record.exceptions';
import { RecordsService } from '@/records/records.service';
import { RedisService } from '@/redis/redis.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;

  interface PrismaMock {
    connection: { findFirst: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  }

  const prismaServiceMock: PrismaMock = {
    connection: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  };

  const recordsServiceMock = {
    findOneByPublicId: jest.fn(),
    incrementConnectionsCount: jest.fn(),
  };

  const redisServiceMock = {
    deleteCachedGraph: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConnectionsService(
      prismaServiceMock as unknown as PrismaService,
      recordsServiceMock as unknown as RecordsService,
      redisServiceMock as unknown as RedisService,
    );
  });

  describe('create', () => {
    test('fromRecordPublicId와 toRecordPublicId가 동일하면 "같은 기록 연결 금지" 예외를 던진다', async () => {
      const userId = 1n;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_same',
        toRecordPublicId: 'rec_same',
      };

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        SameRecordConnectionNotAllowedException,
      );

      // getRecords 내부에서 동일 ID면 recordsService 호출 이전에 예외
      expect(recordsServiceMock.findOneByPublicId).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('fromRecordPublicId에 해당하는 레코드가 없으면 "레코드 없음" 예외를 던진다', async () => {
      const userId = 1n;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_from',
        toRecordPublicId: 'rec_to',
      };

      // Promise.all 이라 둘 다 "호출"은 시작됨
      recordsServiceMock.findOneByPublicId
        .mockRejectedValueOnce(new RecordNotFoundException('rec_from'))
        .mockResolvedValueOnce({ id: 2n, userId, publicId: 'rec_to' });

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        RecordNotFoundException,
      );

      expect(recordsServiceMock.findOneByPublicId).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('toRecordPublicId에 해당하는 레코드가 없으면 "레코드 없음" 예외를 던진다', async () => {
      const userId = 1n;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_from',
        toRecordPublicId: 'rec_to',
      };

      recordsServiceMock.findOneByPublicId
        .mockResolvedValueOnce({ id: 1n, userId, publicId: 'rec_from' })
        .mockRejectedValueOnce(new RecordNotFoundException('rec_to'));

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        RecordNotFoundException,
      );

      expect(recordsServiceMock.findOneByPublicId).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('이미 (A,B) 또는 (B,A) 연결이 존재하면 "연결 중복" 예외를 던진다', async () => {
      const userId = 1n;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      };

      const fromRecord = { id: 10n, userId, publicId: 'rec_a' };
      const toRecord = { id: 20n, userId, publicId: 'rec_b' };

      recordsServiceMock.findOneByPublicId
        .mockResolvedValueOnce(fromRecord)
        .mockResolvedValueOnce(toRecord);

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce({
        id: 999n,
      });

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        ConnectionAlreadyExistsException,
      );

      expect(recordsServiceMock.findOneByPublicId).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('정상 요청이면 트랜잭션으로 (A->B, B->A) 2건을 생성하고, 첫 번째 생성 결과를 응답 DTO로 변환해 반환한다', async () => {
      const userId = 1n;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      };

      const fromRecord = { id: 10n, userId, publicId: 'rec_a' };
      const toRecord = { id: 20n, userId, publicId: 'rec_b' };

      recordsServiceMock.findOneByPublicId
        .mockResolvedValueOnce(fromRecord)
        .mockResolvedValueOnce(toRecord);

      // 중복 없음
      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null);

      const createdAt = new Date('2026-01-13T12:34:56.000Z');

      prismaServiceMock.connection.create
        .mockResolvedValueOnce({
          publicId: 'conn_public',
          createdAt,
          fromRecord: { publicId: 'rec_a' },
          toRecord: { publicId: 'rec_b' },
        })
        .mockResolvedValueOnce({ id: 123n });

      prismaServiceMock.$transaction.mockImplementation(
        async (opsOrFn: any) => {
          if (typeof opsOrFn === 'function') {
            return opsOrFn(prismaServiceMock);
          }
          return Promise.all(opsOrFn);
        },
      );

      const result = await service.create(userId, dto);

      expect(result).toEqual({
        publicId: 'conn_public',
        createdAt: createdAt.toISOString(),
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      });

      expect(recordsServiceMock.findOneByPublicId).toHaveBeenCalledTimes(2);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.connection.create).toHaveBeenCalledTimes(2);

      expect(prismaServiceMock.connection.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: {
            userId,
            fromRecordId: 10n,
            toRecordId: 20n,
          },
          select: expect.any(Object),
        }),
      );

      expect(prismaServiceMock.connection.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: {
            userId,
            fromRecordId: 20n,
            toRecordId: 10n,
          },
          select: { id: true },
        }),
      );
    });
  });
});
