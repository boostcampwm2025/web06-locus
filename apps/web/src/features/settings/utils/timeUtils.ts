/**
 * 시간 관련 유틸리티 함수들
 */

/**
 * 시간을 "오전/오후 HH:mm" 형식으로 포맷팅
 * @param hour 0-23 범위의 시간
 * @param minute 0-59 범위의 분
 * @returns 포맷팅된 시간 문자열 (예: "오후 07:03")
 */
export function formatDisplayTime(hour: number, minute: number): string {
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${period} ${displayHour}:${displayMinute}`;
}

/**
 * "HH:mm" 형식의 시간 문자열을 파싱
 * @param timeString "HH:mm" 형식의 시간 문자열 (예: "19:03")
 * @returns 파싱된 시간과 분 객체
 */
export function parseTimeString(timeString: string): {
  hour: number;
  minute: number;
} {
  const [hour, minute] = timeString.split(':').map(Number);
  return {
    hour: hour ?? 19,
    minute: minute ?? 0,
  };
}

/**
 * 시간과 분을 "HH:mm" 형식의 문자열로 변환
 * @param hour 0-23 범위의 시간
 * @param minute 0-59 범위의 분
 * @returns "HH:mm" 형식의 시간 문자열 (예: "19:03")
 */
export function formatTimeString(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * 시간 옵션 배열 생성 (0-23)
 */
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * 분 옵션 배열 생성 (0-59)
 */
export const MINUTES = Array.from({ length: 60 }, (_, i) => i);
