/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜
 * @returns YYYY.MM.DD 형식의 문자열 (예: "2025.12.15")
 */
export function formatDateShort(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
