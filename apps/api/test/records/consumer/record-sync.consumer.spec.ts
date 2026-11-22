import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { errors } from '@elastic/elasticsearch';
import { RecordSyncConsumer } from '@/records/consumer/record-sync.consumer';
import { RecordSearchService } from '@/records/services/records-search.service';
import { ElasticsearchService } from '@/infra/elasticsearch/elasticsearch.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  NonRetryableMessageError,
  RmqRetryService,
} from '@/mq/rmq-retry.service';
import {
  OUTBOX_EVENT_TYPE,
  OutboxEventType,
} from '@/common/constants/event-types.constants';
import {
  RecordSyncEvent,
  RecordSyncPayload,
} from '@/records/type/record-sync.types';

// ResponseError.statusCode는 getter라서 인스턴스에 직접 값을 정의해 흉내 낸다.
const responseError = (statusCode: number): Error =>
  Object.defineProperties(
    Object.create(errors.ResponseError.prototype) as Error,
    {
      statusCode: { value: statusCode },
      message: { value: `status ${statusCode}` },
    },
  );

/**
 * ES의 external version 의미만 흉내 낸 인메모리 클라이언트
 * - 쓰기는 `version > 현재 버전`일 때만 허용, 아니면 409
 * - 삭제는 문서가 없어도 삭제 버전(tombstone)을 기록하고 404를 돌려줌
 */
class FakeEsClient {
  private readonly docs = new Map<
    string,
    { version: number; source: unknown }
  >();

  readonly index = jest.fn(
    ({
      id,
      document,
      version,
    }: {
      id: string;
      document: unknown;
      version: number;
    }) => {
      const current = this.docs.get(id);
      if (current && version <= current.version) {
        return Promise.reject(responseError(409));
      }
      this.docs.set(id, { version, source: document });
      return Promise.resolve({ result: 'created' });
    },
  );

  readonly delete = jest.fn(
    ({ id, version }: { id: string; version: number }) => {
      const current = this.docs.get(id);
      if (current && version <= current.version) {
        return Promise.reject(responseError(409));
      }
      const existed = !!current?.source;
      this.docs.set(id, { version, source: null });
      return existed
        ? Promise.resolve({ result: 'deleted' })
        : Promise.reject(responseError(404));
    },
  );

  source(id: string): RecordSyncPayload | null {
    return (this.docs.get(id)?.source as RecordSyncPayload | null) ?? null;
  }
}

describe('RecordSyncConsumer (중복·순서·장애 시나리오)', () => {
  let consumer: RecordSyncConsumer;
  let es: FakeEsClient;
  const channel = { ack: jest.fn(), nack: jest.fn() };
  const message = {};
  const retryService = {
    handleFailure: jest.fn().mockResolvedValue('RETRY_SCHEDULED'),
  };
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  } as unknown as RmqContext;

  const snapshot = (
    overrides: Partial<RecordSyncPayload> = {},
  ): RecordSyncPayload => ({
    recordId: '100',
    publicId: 'rec_100',
    userId: '1',
    title: '처음 제목',
    content: '내용',
    isFavorite: false,
    locationName: '서울',
    locationAddress: '서울시',
    tags: [],
    hasImages: false,
    thumbnailImage: null,
    connectionsCount: 0,
    createdAt: '2024-01-15T10:00:00.000Z',
    ...overrides,
  });

  const event = (
    eventId: number | string,
    eventType: string,
    payload: RecordSyncEvent['payload'],
  ): RecordSyncEvent => ({
    eventId: String(eventId),
    eventType: eventType as OutboxEventType,
    aggregateId: '100',
    payload,
  });

  const deliver = (e: RecordSyncEvent) => consumer.handleRecordSync(e, context);

  beforeEach(async () => {
    jest.clearAllMocks();
    es = new FakeEsClient();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordSyncConsumer],
      providers: [
        RecordSearchService,
        ElasticsearchService,
        { provide: NestElasticsearchService, useValue: es },
        { provide: PrismaService, useValue: {} },
        { provide: RmqRetryService, useValue: retryService },
      ],
    }).compile();

    consumer = module.get(RecordSyncConsumer);
  });

  describe('이벤트 처리', () => {
    test.each([
      OUTBOX_EVENT_TYPE.RECORD_CREATED,
      OUTBOX_EVENT_TYPE.RECORD_UPDATED,
      OUTBOX_EVENT_TYPE.RECORD_FAVORITE_UPDATED,
      OUTBOX_EVENT_TYPE.RECORD_CONNECTIONS_COUNT_UPDATED,
    ])(
      '%s는 스냅샷을 이벤트 ID 버전으로 ES에 덮어쓰고 ACK해야 한다',
      async (type) => {
        // when
        await deliver(event(7, type, snapshot({ title: '스냅샷' })));

        // then
        expect(es.index).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '100',
            version: 7,
            version_type: 'external',
          }),
        );
        expect(es.source('100')?.title).toBe('스냅샷');
        expect(channel.ack).toHaveBeenCalledTimes(1);
        expect(channel.nack).not.toHaveBeenCalled();
      },
    );

    test('RECORD_DELETED는 삭제 버전과 함께 삭제하고 ACK해야 한다', async () => {
      // given
      await deliver(event(1, OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot()));
      jest.clearAllMocks();

      // when
      await deliver(
        event(2, OUTBOX_EVENT_TYPE.RECORD_DELETED, {
          publicId: 'rec_100',
          userId: '1',
        }),
      );

      // then
      expect(es.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '100',
          version: 2,
          version_type: 'external',
        }),
      );
      expect(es.source('100')).toBeNull();
      expect(channel.ack).toHaveBeenCalledTimes(1);
    });
  });

  describe('중복 전달', () => {
    test('같은 이벤트가 여러 번 전달돼도 최종 상태가 같고 모두 ACK되어야 한다', async () => {
      // given
      const created = event(
        1,
        OUTBOX_EVENT_TYPE.RECORD_CREATED,
        snapshot({ title: '한 번만 반영' }),
      );

      // when
      await deliver(created);
      const afterFirst = es.source('100');
      await deliver(created);
      await deliver(created);

      // then
      expect(es.source('100')).toEqual(afterFirst);
      expect(channel.ack).toHaveBeenCalledTimes(3);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    test('즐겨찾기 이후 옛 CREATED가 재전달돼도 즐겨찾기가 되돌아가지 않아야 한다', async () => {
      // given
      const created = event(1, OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot());
      const favorited = event(
        2,
        OUTBOX_EVENT_TYPE.RECORD_FAVORITE_UPDATED,
        snapshot({ isFavorite: true }),
      );
      await deliver(created);
      await deliver(favorited);

      // when: 발행 후 DONE 기록 실패 등으로 옛 이벤트가 다시 도착
      await deliver(created);

      // then
      expect(es.source('100')?.isFavorite).toBe(true);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    test('연결 수가 증가한 뒤 옛 UPDATED가 재전달돼도 연결 수가 줄어들지 않아야 한다', async () => {
      // given
      const updated = event(
        3,
        OUTBOX_EVENT_TYPE.RECORD_UPDATED,
        snapshot({ title: '수정', connectionsCount: 1 }),
      );
      const counted = event(
        4,
        OUTBOX_EVENT_TYPE.RECORD_CONNECTIONS_COUNT_UPDATED,
        snapshot({ title: '수정', connectionsCount: 2 }),
      );
      await deliver(updated);
      await deliver(counted);

      // when
      await deliver(updated);

      // then
      expect(es.source('100')?.connectionsCount).toBe(2);
    });
  });

  describe('순서 뒤바뀜', () => {
    test('UPDATED가 CREATED보다 먼저 도착해도 최종 상태는 가장 높은 버전의 스냅샷이어야 한다', async () => {
      // given
      const created = event(
        3,
        OUTBOX_EVENT_TYPE.RECORD_CREATED,
        snapshot({ title: '처음 제목' }),
      );
      const updated = event(
        5,
        OUTBOX_EVENT_TYPE.RECORD_UPDATED,
        snapshot({ title: '수정된 제목' }),
      );

      // when
      await deliver(updated);
      await deliver(created);

      // then
      expect(es.source('100')?.title).toBe('수정된 제목');
      expect(channel.ack).toHaveBeenCalledTimes(2);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    test('DELETED 이후 늦게 도착한 CREATED/UPDATED가 문서를 되살리지 못해야 한다', async () => {
      // given
      await deliver(
        event(9, OUTBOX_EVENT_TYPE.RECORD_DELETED, {
          publicId: 'rec_100',
          userId: '1',
        }),
      );

      // when
      await deliver(event(3, OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot()));
      await deliver(event(8, OUTBOX_EVENT_TYPE.RECORD_UPDATED, snapshot()));

      // then
      expect(es.source('100')).toBeNull();
      expect(channel.ack).toHaveBeenCalledTimes(3);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    test('문서가 만들어지기도 전에 DELETED가 먼저 와도(404) 이후 CREATED가 무시되어야 한다', async () => {
      // when
      await deliver(
        event(9, OUTBOX_EVENT_TYPE.RECORD_DELETED, {
          publicId: 'rec_100',
          userId: '1',
        }),
      );
      await deliver(event(1, OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot()));

      // then
      expect(es.source('100')).toBeNull();
      expect(channel.nack).not.toHaveBeenCalled();
    });
  });

  describe('장애와 재시도', () => {
    test('ES 장애 시 ACK하지 않고 재시도 처리를 위임하며, 재전달되면 정상 반영되어야 한다', async () => {
      // given
      const created = event(
        1,
        OUTBOX_EVENT_TYPE.RECORD_CREATED,
        snapshot({ title: '장애 후 복구' }),
      );
      es.index.mockRejectedValueOnce(responseError(503));

      // when
      await deliver(created);

      // then: 첫 시도는 재시도 서비스로 위임, 문서는 아직 없음
      expect(retryService.handleFailure).toHaveBeenCalledWith(
        context,
        expect.objectContaining({ statusCode: 503 }),
      );
      expect(channel.ack).not.toHaveBeenCalled();
      expect(es.source('100')).toBeNull();

      // when: 재시도 서비스가 같은 메시지를 다시 발행해 재전달됨
      await deliver(created);

      // then
      expect(channel.ack).toHaveBeenCalledTimes(1);
      expect(es.source('100')?.title).toBe('장애 후 복구');
    });

    test('유효하지 않은 eventId는 ES를 호출하지 않고 재시도 불가 오류로 위임해야 한다', async () => {
      // when
      await deliver(
        event('not-a-number', OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot()),
      );

      // then
      expect(es.index).not.toHaveBeenCalled();
      expect(retryService.handleFailure).toHaveBeenCalledWith(
        context,
        expect.any(NonRetryableMessageError),
      );
      expect(channel.ack).not.toHaveBeenCalled();
    });

    test('알 수 없는 이벤트 타입은 ES를 호출하지 않고 재시도 불가 오류로 위임해야 한다', async () => {
      // when
      await deliver(event(1, 'RECORD_UNKNOWN', snapshot()));

      // then
      expect(es.index).not.toHaveBeenCalled();
      expect(es.delete).not.toHaveBeenCalled();
      expect(retryService.handleFailure).toHaveBeenCalledWith(
        context,
        expect.any(NonRetryableMessageError),
      );
    });

    test('컨슈머는 실패 시 직접 NACK하지 않는다(재시도/DLQ는 RmqRetryService가 담당)', async () => {
      // given
      es.index.mockRejectedValueOnce(responseError(503));

      // when
      await deliver(event(1, OUTBOX_EVENT_TYPE.RECORD_CREATED, snapshot()));

      // then
      expect(channel.nack).not.toHaveBeenCalled();
    });
  });
});
