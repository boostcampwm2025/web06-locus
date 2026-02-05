// Redis 모듈에서 사용하는 토큰 상수
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const REDIS_KEY_PREFIX = {
  PENDING_USER: 'PENDING_USER:',
  REFRESH_TOKEN: 'REFRESH_TOKEN:',
  BLACKLIST: 'BLACKLIST:',
  WEBHOOK_PENDING: 'WEBHOOK_PENDING:',

  // 오리 코멘트용 상수
  DUCK_POOL: 'duck:pool:',
  DUCK_COUNT: 'duck:count:',
} as const;
