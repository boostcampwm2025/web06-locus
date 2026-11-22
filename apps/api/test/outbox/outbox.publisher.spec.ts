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
    markPublishFailed: jest.fn(),
  };

  const mockClientProxy = {
    connect: jest.fn(),
    close: jest.fn(),
    emit: jest.fn(),
  };

  const mockDuckClient = {
    connect: jest.fn(),
    close: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDuckClient.emit.mockReturnValue(of(undefined));

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
        {
          provide: RABBITMQ_CONSTANTS.CLIENTS.DUCK_RECORD_CREATED_PRODUCER,
          useValue: mockDuckClient,
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
      expect(mockDuckClient.connect).toHaveBeenCalled();
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
      expect(mockDuckClient.close).toHaveBeenCalled();
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
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 1,
      });

      // when
      await publisher['processEvent'](mockEvent);

      // then
      expect(mockOutboxService.markPublishFailed).toHaveBeenCalledWith(
        mockEvent,
      );
      expect(mockOutboxService.updateStatus).not.toHaveBeenCalled();
    });

    test('발행은 성공했지만 DONE 업데이트가 실패하면 발행 실패로 세지 않아야 한다', async () => {
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
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockRejectedValue(new Error('DB down'));

      // when & then
      await expect(publisher['processEvent'](mockEvent)).rejects.toThrow(
        'DB down',
      );
      expect(mockOutboxService.markPublishFailed).not.toHaveBeenCalled();
    });

    test('DONE 업데이트 실패 후 다음 주기에 같은 이벤트가 재발행되어도 안전하게 처리된다', async () => {
      // given: 1회차는 발행 성공 + DONE 실패, 2회차는 발행 성공 + DONE 성공
      const mockEvent: Outbox = {
        id: 7n,
        aggregateType: 'RECORD',
        aggregateId: 123n,
        eventType: 'RECORD_CREATED',
        payload: {},
        status: OutboxStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        processedAt: null,
      };
      mockOutboxService.getPendingOutboxEvents.mockResolvedValue([mockEvent]);
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus
        .mockRejectedValueOnce(new Error('DB down'))
        .mockResolvedValueOnce(undefined);

      // when
      await publisher.publishPendingEvents();
      await publisher.publishPendingEvents();

      // then: 같은 eventId가 두 번 발행되고(최소 한 번 전달), 실패로 기록되지 않는다
      const publishedIds = mockClientProxy.emit.mock.calls.map(
        (call: [string, { eventId: string }]) => call[1].eventId,
      );
      expect(publishedIds).toEqual(['7', '7']);
      expect(mockOutboxService.markPublishFailed).not.toHaveBeenCalled();
      expect(mockOutboxService.updateStatus).toHaveBeenLastCalledWith(
        7n,
        OutboxStatus.DONE,
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
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.DEAD,
        retryCount: 5,
      });
      const loggerErrorSpy = jest.spyOn(publisher['logger'], 'error');

      // when
      await publisher['processEvent'](mockEvent);

      // then
      expect(mockOutboxService.markPublishFailed).toHaveBeenCalledWith(
        mockEvent,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '🚨 DLQ: Event 1가 최종 실패 처리되었습니다.',
      );
      expect(mockOutboxService.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('오리 큐 분리 발행', () => {
    const buildEvent = (overrides: Partial<Outbox> = {}): Outbox => ({
      id: 7n,
      aggregateType: 'RECORD',
      aggregateId: 123n,
      eventType: 'RECORD_CREATED',
      payload: { recordId: '123', userId: '42', title: 'Test' },
      status: OutboxStatus.PENDING,
      retryCount: 0,
      createdAt: new Date(),
      processedAt: null,
      ...overrides,
    });

    test('RECORD_CREATED는 ES 동기화 큐와 오리 큐 모두에 발행하고 DONE 처리해야 한다', async () => {
      // given
      const event = buildEvent();
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['processEvent'](event);

      // then
      expect(mockClientProxy.emit).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.PATTERNS.RECORD_SYNC,
        expect.objectContaining({ eventId: '7' }),
      );
      expect(mockDuckClient.emit).toHaveBeenCalledWith(
        RABBITMQ_CONSTANTS.PATTERNS.DUCK_RECORD_CREATED,
        { eventId: '7', userId: '42', recordId: '123' },
      );
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        7n,
        OutboxStatus.DONE,
      );
    });

    test.each(['RECORD_UPDATED', 'RECORD_FAVORITE_UPDATED', 'RECORD_DELETED'])(
      '%s는 오리 큐로 보내지 않아야 한다',
      async (eventType) => {
        // given
        mockClientProxy.emit.mockReturnValue(of(undefined));
        mockOutboxService.updateStatus.mockResolvedValue(undefined);

        // when
        await publisher['processEvent'](
          buildEvent({ eventType: eventType as Outbox['eventType'] }),
        );

        // then
        expect(mockClientProxy.emit).toHaveBeenCalledTimes(1);
        expect(mockDuckClient.emit).not.toHaveBeenCalled();
        expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
          7n,
          OutboxStatus.DONE,
        );
      },
    );

    test('userId를 알 수 없으면 오리 큐 발행만 건너뛰고 ES 동기화는 정상 완료해야 한다', async () => {
      // given
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher['processEvent'](buildEvent({ payload: { title: 'x' } }));

      // then
      expect(mockClientProxy.emit).toHaveBeenCalledTimes(1);
      expect(mockDuckClient.emit).not.toHaveBeenCalled();
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        7n,
        OutboxStatus.DONE,
      );
      expect(mockOutboxService.markPublishFailed).not.toHaveBeenCalled();
    });

    test('오리 큐 발행이 실패하면 DONE 처리하지 않고 발행 실패로 기록해야 한다', async () => {
      // given
      const event = buildEvent();
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockDuckClient.emit.mockReturnValue(
        throwError(() => new Error('duck queue down')),
      );
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 1,
      });

      // when
      await publisher['processEvent'](event);

      // then
      expect(mockOutboxService.markPublishFailed).toHaveBeenCalledWith(event);
      expect(mockOutboxService.updateStatus).not.toHaveBeenCalled();
    });

    test('ES 동기화 큐 발행이 실패하면 오리 큐로는 보내지 않아야 한다', async () => {
      // given
      mockClientProxy.emit.mockReturnValue(
        throwError(() => new Error('sync queue down')),
      );
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 1,
      });

      // when
      await publisher['processEvent'](buildEvent());

      // then
      expect(mockDuckClient.emit).not.toHaveBeenCalled();
      expect(mockOutboxService.markPublishFailed).toHaveBeenCalledTimes(1);
    });

    test('오리 큐 발행 실패 후 재시도하면 두 큐 모두에 같은 eventId를 다시 보낸다(컨슈머 멱등으로 흡수)', async () => {
      // given: 1회차는 오리 큐 실패, 2회차는 성공
      const event = buildEvent();
      mockOutboxService.getPendingOutboxEvents.mockResolvedValue([event]);
      mockClientProxy.emit.mockReturnValue(of(undefined));
      mockDuckClient.emit
        .mockReturnValueOnce(throwError(() => new Error('duck queue down')))
        .mockReturnValueOnce(of(undefined));
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 1,
      });
      mockOutboxService.updateStatus.mockResolvedValue(undefined);

      // when
      await publisher.publishPendingEvents();
      await publisher.publishPendingEvents();

      // then
      const syncIds = mockClientProxy.emit.mock.calls.map(
        (call: [string, { eventId: string }]) => call[1].eventId,
      );
      expect(syncIds).toEqual(['7', '7']);
      expect(mockDuckClient.emit).toHaveBeenCalledTimes(2);
      expect(mockOutboxService.updateStatus).toHaveBeenCalledTimes(1);
      expect(mockOutboxService.updateStatus).toHaveBeenCalledWith(
        7n,
        OutboxStatus.DONE,
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
    const buildOutbox = (overrides: Partial<Outbox> = {}): Outbox => ({
      id: 1n,
      aggregateType: 'RECORD',
      aggregateId: 123n,
      eventType: 'RECORD_CREATED',
      payload: {},
      status: OutboxStatus.PENDING,
      retryCount: 0,
      createdAt: new Date(),
      processedAt: null,
      ...overrides,
    });

    test('실패를 기록하도록 OutboxService에 위임해야 한다', async () => {
      // given
      const mockOutbox = buildOutbox({ retryCount: 2 });
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 3,
      });

      // when
      await publisher['handlePublishFailure'](mockOutbox);

      // then
      expect(mockOutboxService.markPublishFailed).toHaveBeenCalledWith(
        mockOutbox,
      );
      expect(mockOutboxService.updateStatus).not.toHaveBeenCalled();
    });

    test('최종 실패(DEAD) 시 에러 로그를 남겨야 한다', async () => {
      // given
      const mockOutbox = buildOutbox({
        id: 999n,
        status: OutboxStatus.RETRY,
        retryCount: 4,
      });
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.DEAD,
        retryCount: 5,
      });
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
      const mockOutbox = buildOutbox({ id: 123n, retryCount: 1 });
      mockOutboxService.markPublishFailed.mockResolvedValue({
        status: OutboxStatus.RETRY,
        retryCount: 2,
      });
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
