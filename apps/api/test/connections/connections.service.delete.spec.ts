import { ConnectionsService } from '@/connections/connections.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ConnectionNotFoundException,
  PairConnectionNotFoundException,
} from '@/connections/exceptions/business.exception';
import { RecordsService } from '@/records/records.service';
import { RedisService } from '@/redis/redis.service';

interface PrismaMock {
  record: { findUnique: jest.Mock };
  connection: {
    findFirst: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
}

describe('ConnectionsService - delete / findPairConnections', () => {
  let service: ConnectionsService;
  let prismaServiceMock: PrismaMock;
  let recordsServiceMock: {
    findOneByPublicId: jest.Mock;
    incrementConnectionsCount: jest.Mock;
    findOneById: jest.Mock;
  };
  let redisServiceMock: { deleteCachedGraph: jest.Mock };

  beforeEach(() => {
    prismaServiceMock = {
      record: { findUnique: jest.fn() },
      connection: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    recordsServiceMock = {
      findOneByPublicId: jest.fn(),
      incrementConnectionsCount: jest.fn(),
      findOneById: jest.fn(),
    };

    redisServiceMock = {
      deleteCachedGraph: jest.fn(),
    };

    service = new ConnectionsService(
      prismaServiceMock as unknown as PrismaService,
      recordsServiceMock as unknown as RecordsService,
      redisServiceMock as unknown as RedisService,
    );

    jest.clearAllMocks();
  });

  describe('findPairConnections', () => {
    test('publicId에 해당하는 연결이 없으면 ConnectionNotFoundException을 던진다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null);

      // private 메서드라서 캐스팅으로 접근
      await expect(
        (service as any).findPairConnections(userId, publicId),
      ).rejects.toBeInstanceOf(ConnectionNotFoundException);

      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledWith({
        where: { userId, publicId },
      });
    });

    test('첫 번째 연결은 찾았지만, 짝(반대방향) 연결을 찾지 못하면 PairConnectionNotFoundException을 던진다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      const findOne = {
        id: 100n,
        fromRecordId: 10n,
        toRecordId: 20n,
        publicId: 'conn_aaa',
      };

      prismaServiceMock.connection.findFirst
        .mockResolvedValueOnce(findOne) // 첫 번째 findFirst 결과
        .mockResolvedValueOnce(null); // pair findFirst 결과 없음

      recordsServiceMock.findOneById
        .mockResolvedValueOnce({ id: 10n, userId })
        .mockResolvedValueOnce({ id: 20n, userId });

      await expect(
        (service as any).findPairConnections(userId, publicId),
      ).rejects.toBeInstanceOf(PairConnectionNotFoundException);

      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(2);

      // 1) findOne 조회 호출 검증
      expect(prismaServiceMock.connection.findFirst).toHaveBeenNthCalledWith(
        1,
        {
          where: { userId, publicId },
        },
      );

      // 2) pair 조회 호출 검증 (from/to 뒤집어서)
      expect(prismaServiceMock.connection.findFirst).toHaveBeenNthCalledWith(
        2,
        {
          where: {
            userId,
            fromRecordId: 20n,
            toRecordId: 10n,
          },
        },
      );
    });

    test('연결과 짝 연결을 모두 찾으면 [findOne, findPair]를 반환한다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      const findOne = {
        id: 100n,
        fromRecordId: 10n,
        toRecordId: 20n,
        publicId: 'conn_aaa',
      };

      const findPair = {
        id: 200n,
        publicId: 'conn_bbb',
      };

      prismaServiceMock.connection.findFirst
        .mockResolvedValueOnce(findOne)
        .mockResolvedValueOnce(findPair);

      recordsServiceMock.findOneById
        .mockResolvedValueOnce({ id: 10n, userId, publicId: 'rec_a' })
        .mockResolvedValueOnce({ id: 20n, userId, publicId: 'rec_b' });

      const result = await (service as any).findPairConnections(
        userId,
        publicId,
      );

      expect(result).toEqual({
        connection: findOne,
        pairConnection: findPair,
        fromRecord: { id: 10n, userId, publicId: 'rec_a' },
        toRecord: { id: 20n, userId, publicId: 'rec_b' },
      });
      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    test('publicId에 해당하는 연결이 없으면 ConnectionNotFoundException을 던지고, 트랜잭션 삭제는 호출하지 않는다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null);

      await expect(service.delete(userId, publicId)).rejects.toBeInstanceOf(
        ConnectionNotFoundException,
      );

      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.deleteMany).not.toHaveBeenCalled();
    });

    test('짝(반대방향) 연결이 없으면 PairConnectionNotFoundException을 던지고, 트랜잭션 삭제는 호출하지 않는다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      const findOne = {
        id: 100n,
        fromRecordId: 10n,
        toRecordId: 20n,
        publicId: 'conn_aaa',
      };

      prismaServiceMock.connection.findFirst
        .mockResolvedValueOnce(findOne)
        .mockResolvedValueOnce(null);

      recordsServiceMock.findOneById
        .mockResolvedValueOnce({ id: 10n, userId, publicId: 'rec_a' })
        .mockResolvedValueOnce({ id: 20n, userId, publicId: 'rec_b' });

      await expect(service.delete(userId, publicId)).rejects.toBeInstanceOf(
        PairConnectionNotFoundException,
      );

      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.deleteMany).not.toHaveBeenCalled();
    });

    test('연결과 짝 연결이 모두 존재하면 트랜잭션으로 2건 삭제를 수행하고 publicId/pairPublicId를 반환한다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      const findOne = {
        id: 100n,
        fromRecordId: 10n,
        toRecordId: 20n,
        publicId: 'conn_aaa',
      };

      const findPair = {
        id: 200n,
        publicId: 'conn_bbb',
      };

      prismaServiceMock.connection.findFirst
        .mockResolvedValueOnce(findOne)
        .mockResolvedValueOnce(findPair);

      recordsServiceMock.findOneById
        .mockResolvedValueOnce({ id: 10n, userId, publicId: 'rec_a' })
        .mockResolvedValueOnce({ id: 20n, userId, publicId: 'rec_b' });

      recordsServiceMock.incrementConnectionsCount.mockResolvedValue(undefined);

      // deleteMany는 실제 결과를 사용하지 않으므로 대충 반환
      prismaServiceMock.connection.deleteMany.mockResolvedValue({} as any);

      // transaction은 배열/콜백 모두 처리
      prismaServiceMock.$transaction.mockImplementation(
        async (opsOrFn: any) => {
          if (typeof opsOrFn === 'function') {
            return opsOrFn(prismaServiceMock);
          }
          return Promise.all(opsOrFn);
        },
      );

      const result = await service.delete(userId, publicId);

      expect(result).toEqual({
        publicId: 'conn_aaa',
        pairPublicId: 'conn_bbb',
      });

      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.connection.deleteMany).toHaveBeenCalledTimes(1);

      // deleteMany 호출 인자 검증
      expect(prismaServiceMock.connection.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [100n, 200n] } },
      });
    });
  });
});
