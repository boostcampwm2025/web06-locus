// HH:mm:ss 형식을 HH:mm 형식으로 변환
export const formatToTime = (time: string): string => {
  return time.split(':').slice(0, 2).join(':');
};

// Date를 HH:mm 형식으로 변환
export const formatDateToTime = (date: Date): string => {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatTimeToDate = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
