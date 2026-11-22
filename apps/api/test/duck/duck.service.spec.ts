import { Test, TestingModule } from '@nestjs/testing';
import { DuckService } from '@/duck/duck.service';
import { RedisService } from '@/redis/redis.service';
import { RecordsService } from '@/records/records.service';
import { NcpAiService } from '@/duck/ncp-ai.service';
import { UsersService } from '@/users/users.service';
import { DUCK_POLICY } from '@/duck/constants/duck.policy.constants';
import { REDIS_KEY_PREFIX } from '@/redis/redis.constants';

describe('DuckService.handleRecordCreated (멱등 처리)', () => {
  let service: DuckService;
  let refreshComments: jest.Mock;

  const mockRedisService = {
    setIfAbsent: jest.fn(),
    incr: jest.fn(),
    isExists: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  const event = { eventId: '77', userId: '42', recordId: '100' };
  const eventKey = `${REDIS_KEY_PREFIX.DUCK_EVENT}77`;
  const countKey = `${REDIS_KEY_PREFIX.DUCK_COUNT}42`;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedisService.setIfAbsent.mockResolvedValue(true);
    mockRedisService.incr.mockResolvedValue(1);
    mockRedisService.isExists.mockResolvedValue(true);
    mockRedisService.del.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuckService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: RecordsService, useValue: {} },
        { provide: NcpAiService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get(DuckService);
    refreshComments = jest.fn().mockResolvedValue([]);
    (service as unknown as { refreshComments: jest.Mock }).refreshComments =
      refreshComments;
  });

  test('처음 보는 이벤트는 이벤트 ID를 선점하고 카운트를 1 올려야 한다', async () => {
    // when
    const result = await service.handleRecordCreated(event);

    // then
    expect(result).toBe('PROCESSED');
    expect(mockRedisService.setIfAbsent).toHaveBeenCalledWith(
      eventKey,
      '1',
      DUCK_POLICY.EVENT_DEDUP_TTL,
    );
    expect(mockRedisService.incr).toHaveBeenCalledWith(countKey);
    expect(refreshComments).not.toHaveBeenCalled();
  });

  test('이미 처리한 이벤트가 다시 전달되면 카운트를 올리지 않고 건너뛰어야 한다', async () => {
    // given
    mockRedisService.setIfAbsent.mockResolvedValue(false);

    // when
    const result = await service.handleRecordCreated(event);

    // then
    expect(result).toBe('DUPLICATE');
    expect(mockRedisService.incr).not.toHaveBeenCalled();
    expect(refreshComments).not.toHaveBeenCalled();
  });

  test('같은 이벤트를 3번 전달해도 카운트는 한 번만 오른다', async () => {
    // given: 선점 결과를 실제 Redis처럼 흉내 낸다(처음만 true)
    const claimed = new Set<string>();
    mockRedisService.setIfAbsent.mockImplementation((key: string) => {
      if (claimed.has(key)) return Promise.resolve(false);
      claimed.add(key);
      return Promise.resolve(true);
    });

    // when
    const results = [
      await service.handleRecordCreated(event),
      await service.handleRecordCreated(event),
      await service.handleRecordCreated(event),
    ];

    // then
    expect(results).toEqual(['PROCESSED', 'DUPLICATE', 'DUPLICATE']);
    expect(mockRedisService.incr).toHaveBeenCalledTimes(1);
  });

  test('임계치에 도달하면 멘트를 갱신하고 카운트를 초기화해야 한다', async () => {
    // given
    mockRedisService.incr.mockResolvedValue(DUCK_POLICY.UPDATE_THRESHOLD);

    // when
    await service.handleRecordCreated(event);

    // then
    expect(refreshComments).toHaveBeenCalledWith(42n);
    expect(mockRedisService.del).toHaveBeenCalledWith(countKey);
  });

  test('멘트 풀이 없으면 임계치 전이라도 갱신해야 한다', async () => {
    // given
    mockRedisService.isExists.mockResolvedValue(false);

    // when
    await service.handleRecordCreated(event);

    // then
    expect(refreshComments).toHaveBeenCalledWith(42n);
  });

  test('카운트 단계가 실패하면 선점을 풀고 예외를 던져 재시도되게 해야 한다', async () => {
    // given
    mockRedisService.incr.mockRejectedValue(new Error('redis down'));

    // when & then
    await expect(service.handleRecordCreated(event)).rejects.toThrow(
      'redis down',
    );
    expect(mockRedisService.del).toHaveBeenCalledWith(eventKey);
  });

  test('선점 해제까지 실패해도 원래 예외를 던져야 한다', async () => {
    // given
    mockRedisService.incr.mockRejectedValue(new Error('redis down'));
    mockRedisService.del.mockRejectedValue(new Error('del failed'));

    // when & then
    await expect(service.handleRecordCreated(event)).rejects.toThrow(
      'redis down',
    );
  });

  test('멘트 갱신이 실패해도 선점을 유지하고 예외를 던지지 않아야 한다(카운트는 이미 반영됨)', async () => {
    // given
    mockRedisService.incr.mockResolvedValue(DUCK_POLICY.UPDATE_THRESHOLD);
    refreshComments.mockRejectedValue(new Error('ai down'));

    // when
    const result = await service.handleRecordCreated(event);

    // then
    expect(result).toBe('PROCESSED');
    expect(mockRedisService.del).not.toHaveBeenCalledWith(eventKey);
  });
});
