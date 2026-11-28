import { RedisService } from '@/redis/redis.service';

describe('RedisService.setIfAbsent', () => {
  const mockClient = { set: jest.fn() };
  let service: RedisService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RedisService(mockClient as never);
  });

  test('키가 없어 저장되면(OK) true를 돌려주고 NX + EX 옵션으로 저장해야 한다', async () => {
    // given
    mockClient.set.mockResolvedValue('OK');

    // when
    const result = await service.setIfAbsent('duck:event:1', '1', 86400);

    // then
    expect(result).toBe(true);
    expect(mockClient.set).toHaveBeenCalledWith('duck:event:1', '1', {
      condition: 'NX',
      expiration: { type: 'EX', value: 86400 },
    });
  });

  test('이미 키가 있어 저장되지 않으면(null) false를 돌려줘야 한다', async () => {
    // given
    mockClient.set.mockResolvedValue(null);

    // when & then
    await expect(service.setIfAbsent('duck:event:1', '1', 86400)).resolves.toBe(
      false,
    );
  });
});
