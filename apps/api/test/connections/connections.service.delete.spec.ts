import { ConnectionsService } from '@/connections/connections.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  PairConnectionNotFoundException,
  RecordNotFoundException,
} from '@/connections/exceptions/business.exception';

interface PrismaMock {
  record: { findUnique: jest.Mock };
  connection: {
    findFirst: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
}

describe('ConnectionsService - delete / findPairConnections', () => {
  let service: ConnectionsService;
  let prismaServiceMock: PrismaMock;

  beforeEach(() => {
    prismaServiceMock = {
      record: { findUnique: jest.fn() },
      connection: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    service = new ConnectionsService(
      prismaServiceMock as unknown as PrismaService,
    );
    jest.clearAllMocks();
  });

  describe('findPairConnections', () => {
    test('publicId에 해당하는 연결이 없으면 RecordNotFoundException을 던진다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null);

      // private 메서드라서 캐스팅으로 접근
      await expect(
        (service as any).findPairConnections(userId, publicId),
      ).rejects.toBeInstanceOf(RecordNotFoundException);

      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledWith({
        where: { userId, publicId },
        select: {
          id: true,
          fromRecordId: true,
          toRecordId: true,
          publicId: true,
        },
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

      await expect(
        (service as any).findPairConnections(userId, publicId),
      ).rejects.toBeInstanceOf(PairConnectionNotFoundException);

      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(2);

      // 1) findOne 조회 호출 검증
      expect(prismaServiceMock.connection.findFirst).toHaveBeenNthCalledWith(
        1,
        {
          where: { userId, publicId },
          select: {
            id: true,
            fromRecordId: true,
            toRecordId: true,
            publicId: true,
          },
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
          select: { id: true, publicId: true },
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

      const result = await (service as any).findPairConnections(
        userId,
        publicId,
      );

      expect(result).toEqual([findOne, findPair]);
      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    test('publicId에 해당하는 연결이 없으면 RecordNotFoundException을 던지고, 트랜잭션 삭제는 호출하지 않는다', async () => {
      const userId = 1n;
      const publicId = 'conn_aaa';

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null);

      await expect(service.delete(userId, publicId)).rejects.toBeInstanceOf(
        RecordNotFoundException,
      );

      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.delete).not.toHaveBeenCalled();
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

      await expect(service.delete(userId, publicId)).rejects.toBeInstanceOf(
        PairConnectionNotFoundException,
      );

      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.delete).not.toHaveBeenCalled();
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

      // delete는 실제 결과를 사용하지 않으므로 대충 반환
      prismaServiceMock.connection.delete.mockResolvedValue({} as any);

      // transaction은 전달된 ops를 실행한 결과를 반환하도록
      prismaServiceMock.$transaction.mockImplementation(async (ops: any[]) =>
        Promise.all(ops),
      );

      const result = await service.delete(userId, publicId);

      expect(result).toEqual({
        publicId: 'conn_aaa',
        pairPublicId: 'conn_bbb',
      });

      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.connection.delete).toHaveBeenCalledTimes(2);

      // delete 호출 인자 검증
      expect(prismaServiceMock.connection.delete).toHaveBeenNthCalledWith(1, {
        where: { id: 100n },
      });
      expect(prismaServiceMock.connection.delete).toHaveBeenNthCalledWith(2, {
        where: { id: 200n },
      });
    });
  });
});
