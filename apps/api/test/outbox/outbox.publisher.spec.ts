/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxPublisher } from '../../src/outbox/outbox.publisher';
import { OutboxService } from '../../src/outbox/outbox.service';
import { Outbox, OutboxStatus } from '@prisma/client';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';
import { of, throwError } from 'rxjs';

describe('OutboxPublisher', () => {
  let publisher: OutboxPublisher;

  const mockOutboxService = {
    getPendingOutboxEvents: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockClientProxy = {
    connect: jest.fn(),
    close: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxPublisher,
        {
          provide: OutboxService,
          useValue: mockOutboxService,
        },
        {
          provide: RABBITMQ_CONSTANTS.CLIENTS.RECORD_SYNC_PRODUCER,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    publisher = module.get<OutboxPublisher>(OutboxPublisher);
  });

  describe('onModuleInit', () => {
    test('RabbitMQ에 연결해야 한다', async () => {
      // given
      mockClientProxy.connect.mockResolvedValue(undefined);

      // when
      await publisher.onModuleInit();

      // then
      expect(mockClientProxy.connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    test('RabbitMQ 연결을 해제해야 한다', async () => {
      // given
      mockClientProxy.close.mockResolvedValue(undefined);

      // when
      await publisher.onModuleDestroy();

      // then
      expect(mockClientProxy.close).toHaveBeenCalled();
    });
  });

  describe('publishPendingEvents', () => {
    test('대기 중인 이벤트를 처리해야 한다', async () => {
      // given
      const mockEvents: Outbox[] = [
        {
          id: 1n,
          aggregateType: 'RECORD',
          aggregateId: 123n,
          eventType: 'RECORD_CREATED',
          payload: { title: 'Test' },
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date(),
          processedAt: null,
        },
      ];
      mockOutboxService.getPendingOutboxEvents.mockResolvedValue(mockEvents);
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher.publishPendingEvents();

      // then
      expect(mockOutboxService.getPendingOutboxEvents).toHaveBeenCalled();
      expect(mockClientProxy.emit).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC,
        expect.objectContaining({
          eventId: '1',
          eventType: 'RECORD_CREATED',
          aggregateId: '123',
          aggregateType: 'RECORD',
        }),
      );
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.DONE,
      );
    });

    test('대기 중인 이벤트가 없으면 아무 것도 하지 않아야 한다', async () => {
      // given
      mockOutboxService.getPendingOutboxEvents.mockResolvedValue([]);

      // when
      await publisher.publishPendingEvents();

      // then
      expect(mockOutboxService.getPendingOutboxEvents).toHaveBeenCalled();
      expect(mockClientProxy.emit).not.toHaveBeenCalled();
      expect(mockOutboxService.updateStatus).not.toHaveBeenCalled();
    });

    test('이미 처리 중이면 중복 실행하지 않아야 한다', async () => {
      // given
      publisher['isProcessing'] = true;

      // when
      await publisher.publishPendingEvents();

      // then
      expect(mockOutboxService.getPendingOutboxEvents).not.toHaveBeenCalled();
    });

    test('여러 이벤트를 순차적으로 처리해야 한다', async () => {
      // given
      const mockEvents: Outbox[] = [
        {
          id: 1n,
          aggregateType: 'RECORD',
          aggregateId: 111n,
          eventType: 'RECORD_CREATED',
          payload: {},
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date(),
          processedAt: null,
        },
        {
          id: 2n,
          aggregateType: 'RECORD',
          aggregateId: 222n,
          eventType: 'RECORD_UPDATED',
          payload: {},
          status: OutboxStatus.PENDING,
          retryCount: 0,
          createdAt: new Date(),
          processedAt: null,
        },
      ];
      mockOutboxService.getPendingOutboxEvents.mockResolvedValue(mockEvents);
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher.publishPendingEvents();

      // then
      expect(mockClientProxy.emit).toHaveBeenCalledTimes(2);
      expect(mockOutboxService.updateStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('processEvent', () => {
    test('이벤트를 성공적으로 발행하면 상태를 DONE으로 업데이트해야 한다', async () => {
      // given
      const mockEvent: Outbox = {
        id: 1n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: { title: 'Test' },
        status: OutboxStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        processedAt: null,
      };
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['processEvent'](mockEvent);

      // then
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.DONE,
      );
    });

    test('이벤트 발행 실패 시 재시도 카운트를 증가시켜야 한다', async () => {
      // given
      const mockEvent: Outbox = {
        id: 1n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        processedAt: null,
      };
      const error = new Error('Publish failed');
      mockClientProxy.emit.mockReturnValue(throwError(() => error));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['processEvent'](mockEvent);

      // then
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.RETRY,
      );
    });

    test('최대 재시도 횟수 초과 시 상태를 DEAD로 업데이트해야 한다', async () => {
      // given
      const mockEvent: Outbox = {
        id: 1n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.RETRY,
        retryCount: 4,
        createdAt: new Date(),
        processedAt: null,
      };
      const error = new Error('Publish failed');
      mockClientProxy.emit.mockReturnValue(throwError(() => error));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['processEvent'](mockEvent);

      // then
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.DEAD,
      );
    });
  });

  describe('convertToOutboxEvent', () => {
    test('Outbox를 OutboxEvent로 변환해야 한다', () => {
      // given
      const mockOutbox: Outbox = {
        id: 123n,
        aggregateType: 'RECORD',
        aggregateId: 456n,
        eventType: 'RECORD_CREATED',
        payload: { title: 'Test Record' },
        status: OutboxStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        processedAt: null,
      };

      // when
      const result = publisher['convertToOutboxEvent'](mockOutbox);

      // then
      expect(result).toEqual({
        eventId: '123',
        eventType: 'RECORD_CREATED',
        aggregateId: '456',
        aggregateType: 'RECORD',
        payload: { title: 'Test Record' },
        timestamp: expect.any(String),
      });
    });

    test('bigint ID를 문자열로 변환해야 한다', () => {
      // given
      const mockOutbox: Outbox = {
        id: 999n,
        aggregateType: 'RECORD',
        aggregateId: 111n,
        eventType: 'RECORD_UPDATED',
        payload: {},
        status: OutboxStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        processedAt: null,
      };

      // when
      const result = publisher['convertToOutboxEvent'](mockOutbox);

      // then
      expect(result.eventId).toBe('999');
      expect(typeof result.eventId).toBe('string');
    });
  });

  describe('handlePublishFailure', () => {
    test('재시도 횟수가 5 미만이면 RETRY 상태로 업데이트해야 한다', async () => {
      // given
      const mockOutbox: Outbox = {
        id: 1n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.PENDING,
        retryCount: 2,
        createdAt: new Date(),
        processedAt: null,
      };
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['handlePublishFailure'](mockOutbox);

      // then
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.RETRY,
      );
    });

    test('재시도 횟수가 5 이상이면 DEAD 상태로 업데이트해야 한다', async () => {
      // given
      const mockOutbox: Outbox = {
        id: 1n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.RETRY,
        retryCount: 4,
        createdAt: new Date(),
        processedAt: null,
      };
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['handlePublishFailure'](mockOutbox);

      // then
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        1n,
        OutboxStatus.DEAD,
      );
    });

    test('최종 실패 시 에러 로그를 남겨야 한다', async () => {
      // given
      const mockOutbox: Outbox = {
        id: 999n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.RETRY,
        retryCount: 4,
        createdAt: new Date(),
        processedAt: null,
      };
      mockOutboxService.updateStatus.mockResolvedValue(undefined);
      const loggerErrorSpy = jest.spyOn(publisher['logger'], 'error');

      // when
      await publisher['handlePublishFailure'](mockOutbox);

      // then
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '🚨 DLQ: Event 999가 최종 실패 처리되었습니다.',
      );
    });

    test('재시도 시 경고 로그를 남겨야 한다', async () => {
      // given
      const mockOutbox: Outbox = {
        id: 123n,
        aggregateType: 'RECORD',
        aggregateId: 456n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.PENDING,
        retryCount: 1,
        createdAt: new Date(),
        processedAt: null,
      };
      mockOutboxService.updateStatus.mockResolvedValue(undefined);
      const loggerWarnSpy = jest.spyOn(publisher['logger'], 'warn');

      // when
      await publisher['handlePublishFailure'](mockOutbox);

      // then
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        '⚠️ Event 123 발행 실패 (재시도 2 / 5)',
      );
    });
  });
});
