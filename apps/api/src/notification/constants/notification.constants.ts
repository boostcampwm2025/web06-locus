export const NotificationType = {
  DAILY_REMINDER: 'DAILY_REMINDER',
  SYSTEM_NOTICE: 'SYSTEM_NOTICE', // NOTE: 추후 추가될..?
};

export const DAILY_REMINDER_TEMPLATE = {
  title: '오늘의 기록을 남겨보세요!',
  body: '하루를 되돌아보며 소중한 순간을 기록해보세요.',
  icon: 'https://lh3.googleusercontent.com/a/ACg8ocIV0GZj1vzsvACdygGmubZVUPKLhASMaJjD-0cS7M3Ccp1S0RU=s576-c-no',
  badge:
    'https://lh3.googleusercontent.com/a/ACg8ocIV0GZj1vzsvACdygGmubZVUPKLhASMaJjD-0cS7M3Ccp1S0RU=s576-c-no',
  link: '/',
  tag: 'daily-reminder',
} as const;
