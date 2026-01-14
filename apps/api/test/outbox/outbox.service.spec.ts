import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from '../../src/outbox/outbox.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Outbox, OutboxStatus } from '@prisma/client';

describe('OutboxService', () => {
  let service: OutboxService;

  const mockPrismaService = {
    outbox: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  describe('getPendingOutboxEvents', () => {
    test('PENDING 상태의 아웃박스 이벤트를 조회해야 한다', async () => {
      // given
      const mockOutboxEvents: Outbox[] = [
        {
          id: 1n,
          aggregateType: 'RECORD',
          aggregateId: 123n,
          eventType: 'RECORD_CREATED',
          payload: { title: 'Test' },
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date('2024-01-01'),
          processedAt: null,
        },
      ];
      mockPrismaService.outbox.findMany.mockResolvedValue(mockOutboxEvents);

      // when
      const result = await service.getPendingOutboxEvents();

      // then
      expect(mockPrismaService.outbox.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: [OutboxStatus.PENDING, OutboxStatus.RETRY] },
          retryCount: { lt: 5 },
        },
        take: 100,
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockOutboxEvents);
    });

    test('RETRY 상태의 아웃박스 이벤트를 조회해야 한다', async () => {
      // given
      const mockOutboxEvents: Outbox[] = [
        {
          id: 2n,
          aggregateType: 'RECORD',
          aggregateId: 456n,
          eventType: 'RECORD_UPDATED',
          payload: { title: 'Updated' },
          status: OutboxStatus.RETRY,
          retryCount: 2,
          createdAt: new Date('2024-01-02'),
          processedAt: null,
        },
      ];
      mockPrismaService.outbox.findMany.mockResolvedValue(mockOutboxEvents);

      // when
      const result = await service.getPendingOutboxEvents();

      // then
      expect(result).toEqual(mockOutboxEvents);
      expect(result[0].status).toBe(OutboxStatus.RETRY);
    });

    test('재시도 횟수가 5 미만인 이벤트만 조회해야 한다', async () => {
      // given
      const mockOutboxEvents: Outbox[] = [
        {
          id: 3n,
          aggregateType: 'RECORD',
          aggregateId: 789n,
          eventType: 'RECORD_DELETED',
          payload: {},
          status: OutboxStatus.RETRY,
          retryCount: 4,
          createdAt: new Date('2024-01-03'),
          processedAt: null,
        },
      ];
      mockPrismaService.outbox.findMany.mockResolvedValue(mockOutboxEvents);

      // when
      const result = await service.getPendingOutboxEvents();

      // then
      expect(mockPrismaService.outbox.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            retryCount: { lt: 5 },
          }),
        }),
      );
      expect(result[0].retryCount).toBeLessThan(5);
    });

    test('최대 100개의 이벤트만 조회해야 한다', async () => {
      // given
      mockPrismaService.outbox.findMany.mockResolvedValue([]);

      // when
      await service.getPendingOutboxEvents();

      // then
      expect(mockPrismaService.outbox.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    test('생성일 기준 오름차순으로 정렬되어야 한다', async () => {
      // given
      const mockOutboxEvents: Outbox[] = [
        {
          id: 1n,
          aggregateType: 'RECORD',
          aggregateId: 111n,
          eventType: 'RECORD_CREATED',
          payload: {},
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date('2024-01-01'),
          processedAt: null,
        },
        {
          id: 2n,
          aggregateType: 'RECORD',
          aggregateId: 222n,
          eventType: 'RECORD_CREATED',
          payload: {},
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date('2024-01-02'),
          processedAt: null,
        },
      ];
      mockPrismaService.outbox.findMany.mockResolvedValue(mockOutboxEvents);

      // when
      await service.getPendingOutboxEvents();

      // then
      expect(mockPrismaService.outbox.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );
    });

    test('조회 결과가 없으면 빈 배열을 반환해야 한다', async () => {
      // given
      mockPrismaService.outbox.findMany.mockResolvedValue([]);

      // when
      const result = await service.getPendingOutboxEvents();

      // then
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    test('PENDING과 RETRY 상태 모두 조회해야 한다', async () => {
      // given
      const mockOutboxEvents: Outbox[] = [
        {
          id: 1n,
          aggregateType: 'RECORD',
          aggregateId: 111n,
          eventType: 'RECORD_CREATED',
          payload: {},
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date('2024-01-01'),
          processedAt: null,
        },
        {
          id: 2n,
          aggregateType: 'RECORD',
          aggregateId: 222n,
          eventType: 'RECORD_UPDATED',
          payload: {},
          status: OutboxStatus.RETRY,
          retryCount: 1,
          createdAt: new Date('2024-01-02'),
          processedAt: null,
        },
      ];
      mockPrismaService.outbox.findMany.mockResolvedValue(mockOutboxEvents);

      // when
      const result = await service.getPendingOutboxEvents();

      // then
      expect(mockPrismaService.outbox.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: [OutboxStatus.PENDING, OutboxStatus.RETRY] },
          }),
        }),
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('updateStatus', () => {
    test('아웃박스 이벤트의 상태를 업데이트해야 한다', async () => {
      // given
      const id = 123n;
      const status = OutboxStatus.PENDING;
      const now = new Date();
      mockPrismaService.outbox.update.mockResolvedValue({
        id,
        status,
        processedAt: now,
      } as Outbox);

      // when
      await service.updateStatus(id, status);

      // then
      expect(mockPrismaService.outbox.update).toHaveBeenCalledWith({
        where: { id },
        data: { status, processedAt: expect.any(Date) },
      });
    });

    test('상태를 RETRY로 업데이트할 수 있어야 한다', async () => {
      // given
      const id = 789n;
      const status = OutboxStatus.RETRY;
      mockPrismaService.outbox.update.mockResolvedValue({} as Outbox);

      // when
      await service.updateStatus(id, status);

      // then
      expect(mockPrismaService.outbox.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OutboxStatus.RETRY }),
        }),
      );
    });

    test('상태를 DONE로 업데이트할 수 있어야 한다', async () => {
      // given
      const id = 999n;
      const status = OutboxStatus.DONE;
      mockPrismaService.outbox.update.mockResolvedValue({} as Outbox);

      // when
      await service.updateStatus(id, status);

      // then
      expect(mockPrismaService.outbox.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OutboxStatus.DONE }),
        }),
      );
    });

    test('processedAt을 현재 시간으로 설정해야 한다', async () => {
      // given
      const id = 111n;
      const status = OutboxStatus.DONE;
      const beforeUpdate = new Date();
      mockPrismaService.outbox.update.mockResolvedValue({} as Outbox);

      // when
      await service.updateStatus(id, status);

      // then
      const updateCall = mockPrismaService.outbox.update.mock.calls[0][0];
      const processedAt = updateCall.data.processedAt as Date;
      expect(processedAt).toBeInstanceOf(Date);
      expect(processedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });
});
