/**
 * 태그 목록에서 표시할 태그와 남은 개수를 계산합니다.
 * @param tags - 전체 태그 목록
 * @param maxCount - 최대 표시할 태그 개수
 * @returns 표시할 태그 목록과 남은 태그 개수
 */
export function getDisplayTags(
  tags: string[],
  maxCount: number,
): {
  displayTags: string[];
  remainingCount: number;
} {
  const displayTags = tags.slice(0, maxCount);
  const remainingCount = tags.length - maxCount;

  return {
    displayTags,
    remainingCount: remainingCount > 0 ? remainingCount : 0,
  };
}
