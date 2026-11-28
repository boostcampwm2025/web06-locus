import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { DuckConsumer } from '@/duck/duck.consumer';
import { DuckService } from '@/duck/duck.service';
import { RmqRetryService } from '@/mq/rmq-retry.service';

describe('DuckConsumer', () => {
  let consumer: DuckConsumer;

  const mockDuckService = { handleRecordCreated: jest.fn() };
  const mockRetryService = {
    handleFailure: jest.fn().mockResolvedValue('RETRY_SCHEDULED'),
  };
  const channel = { ack: jest.fn(), nack: jest.fn() };
  const message = {};
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  } as unknown as RmqContext;
  const event = { eventId: '77', userId: '42', recordId: '100' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DuckConsumer],
      providers: [
        { provide: DuckService, useValue: mockDuckService },
        { provide: RmqRetryService, useValue: mockRetryService },
      ],
    }).compile();

    consumer = module.get(DuckConsumer);
  });

  test.each(['PROCESSED', 'DUPLICATE'])(
    '%s 결과는 메시지를 ACK해야 한다(중복 이벤트도 정상 처리)',
    async (result) => {
      // given
      mockDuckService.handleRecordCreated.mockResolvedValue(result);

      // when
      await consumer.handleRecordCreated(event, context);

      // then
      expect(mockDuckService.handleRecordCreated).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(message);
      expect(mockRetryService.handleFailure).not.toHaveBeenCalled();
    },
  );

  test('처리 실패 시 ACK하지 않고 재시도/DLQ 처리를 위임해야 한다', async () => {
    // given
    const error = new Error('redis down');
    mockDuckService.handleRecordCreated.mockRejectedValue(error);

    // when
    await consumer.handleRecordCreated(event, context);

    // then
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).not.toHaveBeenCalled();
    expect(mockRetryService.handleFailure).toHaveBeenCalledWith(context, error);
  });
});
