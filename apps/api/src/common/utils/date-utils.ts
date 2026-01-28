export const formatToPrismaTime = (time?: string): string | undefined => {
  if (!time) return undefined;
  // 이미 :ss가 붙어있는지 확인 후 처리
  return time.split(':').length === 2 ? `${time}:00` : time;
};

// HH:mm:ss 형식을 HH:mm 형식으로 변환
export const formatToTime = (time: string): string => {
  return time.split(':').slice(0, 2).join(':');
};

// Date를 HH:mm 형식으로 변환
export const formatDateToTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
