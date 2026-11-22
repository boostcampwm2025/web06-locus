import { RmqContext } from '@nestjs/microservices';
import {
  NonRetryableMessageError,
  RMQ_RETRY_COUNT_HEADER,
  RmqRetryService,
} from '@/mq/rmq-retry.service';

class TestRmqRetryService extends RmqRetryService {
  readonly delays: number[] = [];

  protected override delay(ms: number): Promise<void> {
    this.delays.push(ms);
    return Promise.resolve();
  }
}

describe('RmqRetryService', () => {
  let service: TestRmqRetryService;

  const channel = {
    ack: jest.fn(),
    nack: jest.fn(),
    assertQueue: jest.fn(),
    sendToQueue: jest.fn(),
    waitForConfirms: jest.fn(),
  };

  const buildContext = (
    headers?: Record<string, unknown>,
    ch: unknown = channel,
  ) => {
    const message = {
      content: Buffer.from('{"pattern":"record.sync","data":{"eventId":"7"}}'),
      fields: { routingKey: 'record.sync.queue' },
      properties: {
        contentType: 'application/json',
        headers,
      },
    };
    const context = {
      getChannelRef: () => ch,
      getMessage: () => message,
    } as unknown as RmqContext;
    return { context, message };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    channel.assertQueue.mockResolvedValue({});
    channel.waitForConfirms.mockResolvedValue(undefined);
    channel.sendToQueue.mockReturnValue(true);
    service = new TestRmqRetryService();
  });

  describe('재시도', () => {
    test('첫 실패는 x-retry-count=1로 같은 큐에 다시 발행하고 원본을 ACK해야 한다', async () => {
      // given
      const { context, message } = buildContext();

      // when
      const outcome = await service.handleFailure(context, new Error('boom'));

      // then
      expect(outcome).toBe('RETRY_SCHEDULED');
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'record.sync.queue',
        message.content,
        expect.objectContaining({
          contentType: 'application/json',
          headers: { [RMQ_RETRY_COUNT_HEADER]: 1 },
        }),
      );
      expect(channel.ack).toHaveBeenCalledWith(message);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    test('기존 헤더는 유지하고 재시도 횟수만 올려야 한다', async () => {
      // given
      const { context } = buildContext({
        'x-trace': 'abc',
        [RMQ_RETRY_COUNT_HEADER]: 2,
      });

      // when
      await service.handleFailure(context, new Error('boom'));

      // then
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'record.sync.queue',
        expect.anything(),
        expect.objectContaining({
          headers: { 'x-trace': 'abc', [RMQ_RETRY_COUNT_HEADER]: 3 },
        }),
      );
    });

    test('지수 백오프(1s, 2s, 4s ...)에 상한을 적용해야 한다', async () => {
      // when
      for (const attempt of [0, 1, 2, 3, 4]) {
        const { context } = buildContext({
          [RMQ_RETRY_COUNT_HEADER]: attempt,
        });
        await service.handleFailure(context, new Error('boom'), {
          maxRetries: 10,
        });
      }
      const { context: late } = buildContext({ [RMQ_RETRY_COUNT_HEADER]: 9 });
      await service.handleFailure(late, new Error('boom'), { maxRetries: 10 });

      // then
      expect(service.delays).toEqual([1000, 2000, 4000, 8000, 16000, 30000]);
    });

    test('새 메시지가 브로커에 확정(confirm)된 뒤에 원본을 ACK해야 한다', async () => {
      // given
      const { context } = buildContext();

      // when
      await service.handleFailure(context, new Error('boom'));

      // then
      expect(channel.waitForConfirms).toHaveBeenCalledTimes(1);
      expect(channel.waitForConfirms.mock.invocationCallOrder[0]).toBeLessThan(
        channel.ack.mock.invocationCallOrder[0],
      );
    });

    test('확정 채널이 아니어도(waitForConfirms 없음) 재시도할 수 있어야 한다', async () => {
      // given
      const plain = {
        ack: jest.fn(),
        nack: jest.fn(),
        assertQueue: jest.fn(),
        sendToQueue: jest.fn().mockReturnValue(true),
      };
      const { context, message } = buildContext(undefined, plain);

      // when
      const outcome = await service.handleFailure(context, new Error('boom'));

      // then
      expect(outcome).toBe('RETRY_SCHEDULED');
      expect(plain.ack).toHaveBeenCalledWith(message);
    });
  });

  describe('DLQ', () => {
    test('재시도 상한에 도달하면 <큐>.dlq로 보내고 원본을 ACK해야 한다', async () => {
      // given
      const { context, message } = buildContext({
        [RMQ_RETRY_COUNT_HEADER]: 5,
      });

      // when
      const outcome = await service.handleFailure(
        context,
        new Error('ES 장애가 계속됨'),
      );

      // then
      expect(outcome).toBe('DEAD_LETTERED');
      expect(channel.assertQueue).toHaveBeenCalledWith(
        'record.sync.queue.dlq',
        {
          durable: true,
        },
      );
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'record.sync.queue.dlq',
        message.content,
        expect.objectContaining({
          headers: expect.objectContaining({
            [RMQ_RETRY_COUNT_HEADER]: 5,
            'x-original-queue': 'record.sync.queue',
            'x-error': 'ES 장애가 계속됨',
            'x-failed-at': expect.any(String),
          }),
        }),
      );
      expect(channel.ack).toHaveBeenCalledWith(message);
      expect(service.delays).toEqual([]);
    });

    test('재시도해도 소용없는 오류는 첫 실패에서 바로 DLQ로 보내야 한다', async () => {
      // given
      const { context } = buildContext();

      // when
      const outcome = await service.handleFailure(
        context,
        new NonRetryableMessageError('유효하지 않은 eventId'),
      );

      // then
      expect(outcome).toBe('DEAD_LETTERED');
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'record.sync.queue.dlq',
        expect.anything(),
        expect.anything(),
      );
      expect(service.delays).toEqual([]);
    });

    test('DLQ 큐는 한 번만 선언해야 한다', async () => {
      // when
      for (let i = 0; i < 3; i += 1) {
        const { context } = buildContext({ [RMQ_RETRY_COUNT_HEADER]: 5 });
        await service.handleFailure(context, new Error('boom'));
      }

      // then
      expect(channel.assertQueue).toHaveBeenCalledTimes(1);
    });

    test('에러 메시지는 500자로 잘라 헤더에 남겨야 한다', async () => {
      // given
      const { context } = buildContext({ [RMQ_RETRY_COUNT_HEADER]: 5 });

      // when
      await service.handleFailure(context, new Error('x'.repeat(2000)));

      // then
      const options = channel.sendToQueue.mock.calls[0][2] as {
        headers: Record<string, string>;
      };
      expect(options.headers['x-error']).toHaveLength(500);
    });
  });

  describe('메시지 유실 방지', () => {
    test('재발행에 실패하면 원본을 ACK하지 않고 requeue해야 한다', async () => {
      // given
      const { context, message } = buildContext();
      channel.sendToQueue.mockImplementation(() => {
        throw new Error('channel closed');
      });

      // when
      const outcome = await service.handleFailure(context, new Error('boom'));

      // then
      expect(outcome).toBe('REQUEUED');
      expect(channel.ack).not.toHaveBeenCalled();
      expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    });

    test('확정(confirm)이 실패하면 원본을 ACK하지 않고 requeue해야 한다', async () => {
      // given
      const { context, message } = buildContext();
      channel.waitForConfirms.mockRejectedValue(new Error('nack from broker'));

      // when
      const outcome = await service.handleFailure(context, new Error('boom'));

      // then
      expect(outcome).toBe('REQUEUED');
      expect(channel.ack).not.toHaveBeenCalled();
      expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    });

    test('DLQ 발행에 실패하면 원본을 ACK하지 않고 requeue해야 한다', async () => {
      // given
      const { context, message } = buildContext({
        [RMQ_RETRY_COUNT_HEADER]: 5,
      });
      channel.assertQueue.mockRejectedValue(new Error('cannot declare'));

      // when
      const outcome = await service.handleFailure(context, new Error('boom'));

      // then
      expect(outcome).toBe('REQUEUED');
      expect(channel.ack).not.toHaveBeenCalled();
      expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    });
  });

  describe('x-retry-count 헤더 해석', () => {
    test.each([undefined, 'abc', -1, 1.5, null])(
      '유효하지 않은 값(%p)은 0회로 보고 1회차로 재시도해야 한다',
      async (raw) => {
        // given
        const { context } = buildContext({ [RMQ_RETRY_COUNT_HEADER]: raw });

        // when
        await service.handleFailure(context, new Error('boom'));

        // then
        expect(channel.sendToQueue).toHaveBeenCalledWith(
          'record.sync.queue',
          expect.anything(),
          expect.objectContaining({
            headers: { [RMQ_RETRY_COUNT_HEADER]: 1 },
          }),
        );
      },
    );
  });
});
