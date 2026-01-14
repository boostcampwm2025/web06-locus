import { ConnectionsService } from '@/connections/connections.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateConnectionRequestDto } from '@/connections/dto/create-connection.request.dto';
import {
  ConnectionAlreadyExistsException,
  SameRecordConnectionNotAllowedException,
} from '@/connections/exceptions/business.exception';
import { RecordNotFoundException } from '@/records/exceptions/record.exceptions';
import { RecordsService } from '@/records/records.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;

  interface PrismaMock {
    record: { findUnique: jest.Mock };
    connection: { findFirst: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  }

  const prismaServiceMock: PrismaMock = {
    record: { findUnique: jest.fn() },
    connection: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  };

  const recordsServiceMock = {} as unknown as RecordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConnectionsService(
      prismaServiceMock as unknown as PrismaService,
      recordsServiceMock,
    );
  });

  describe('create', () => {
    test('fromRecordPublicId와 toRecordPublicId가 동일하면 "같은 기록 연결 금지" 예외를 던진다', async () => {
      const userId = 1;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_same',
        toRecordPublicId: 'rec_same',
      };

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        SameRecordConnectionNotAllowedException,
      );

      expect(prismaServiceMock.record.findUnique).not.toHaveBeenCalled();
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('fromRecordPublicId에 해당하는 레코드가 없으면 "레코드 없음" 예외를 던진다', async () => {
      const userId = 1;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_from',
        toRecordPublicId: 'rec_to',
      };

      prismaServiceMock.record.findUnique
        .mockResolvedValueOnce(null as any) // fromRecord 없음
        .mockResolvedValueOnce({ id: 2n, userId, publicId: 'rec_to' } as any);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        RecordNotFoundException,
      );

      expect(prismaServiceMock.record.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('toRecordPublicId에 해당하는 레코드가 없으면 "레코드 없음" 예외를 던진다', async () => {
      const userId = 1;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_from',
        toRecordPublicId: 'rec_to',
      };

      prismaServiceMock.record.findUnique
        .mockResolvedValueOnce({ id: 1n, userId, publicId: 'rec_from' } as any)
        .mockResolvedValueOnce(null as any); // toRecord 없음

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        RecordNotFoundException,
      );

      expect(prismaServiceMock.record.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.connection.findFirst).not.toHaveBeenCalled();
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('이미 (A,B) 또는 (B,A) 연결이 존재하면 "연결 중복" 예외를 던진다', async () => {
      const userId = 1;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      };

      const fromRecord = { id: 10n, userId, publicId: 'rec_a' };
      const toRecord = { id: 20n, userId, publicId: 'rec_b' };

      prismaServiceMock.record.findUnique
        .mockResolvedValueOnce(fromRecord as any)
        .mockResolvedValueOnce(toRecord as any);

      prismaServiceMock.connection.findFirst.mockResolvedValueOnce({
        id: 999n,
      } as any);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        ConnectionAlreadyExistsException,
      );

      expect(prismaServiceMock.connection.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaServiceMock.$transaction).not.toHaveBeenCalled();
    });

    test('정상 요청이면 트랜잭션으로 (A->B, B->A) 2건을 생성하고, 첫 번째 생성 결과를 응답 DTO로 변환해 반환한다', async () => {
      const userId = 1;
      const dto: CreateConnectionRequestDto = {
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      };

      const fromRecord = { id: 10n, userId, publicId: 'rec_a' };
      const toRecord = { id: 20n, userId, publicId: 'rec_b' };

      prismaServiceMock.record.findUnique
        .mockResolvedValueOnce(fromRecord as any)
        .mockResolvedValueOnce(toRecord as any);

      // 중복 없음
      prismaServiceMock.connection.findFirst.mockResolvedValueOnce(null as any);

      const createdAt = new Date('2026-01-13T12:34:56.000Z');

      // transaction 내부에서 호출될 create 2번의 반환값
      prismaServiceMock.connection.create
        .mockResolvedValueOnce({
          publicId: 'conn_public',
          createdAt,
          fromRecord: { publicId: 'rec_a' },
          toRecord: { publicId: 'rec_b' },
        } as any)
        .mockResolvedValueOnce({ id: 123n } as any);

      // $transaction은 전달된 promise 배열을 그대로 await 해서 결과 배열 반환하도록
      prismaServiceMock.$transaction.mockImplementation(async (ops: any[]) =>
        Promise.all(ops),
      );

      const result = await service.create(userId, dto);

      expect(result).toEqual({
        publicId: 'conn_public',
        createdAt: createdAt.toISOString(),
        fromRecordPublicId: 'rec_a',
        toRecordPublicId: 'rec_b',
      });

      // 트랜잭션 호출 확인
      expect(prismaServiceMock.$transaction).toHaveBeenCalledTimes(1);

      // create 2번 호출 확인 (양방향 저장)
      expect(prismaServiceMock.connection.create).toHaveBeenCalledTimes(2);

      // 첫 번째 create 데이터 검증
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

      // 두 번째 create 데이터 검증 (반대 방향)
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
