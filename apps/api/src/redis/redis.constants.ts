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
  // 처리 완료한 오리 이벤트(이벤트 ID) 기록: 중복 전달 시 카운트가 두 번 오르지 않게 한다
  DUCK_EVENT: 'duck:event:',
} as const;
