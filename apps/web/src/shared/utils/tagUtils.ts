/**
 * API 응답의 태그 타입 (객체 배열)
 */
export interface ApiTag {
  publicId: string;
  name: string;
}

/**
 * 태그를 문자열 배열로 변환
 * API 응답의 태그 객체 배열을 문자열 배열로 변환
 * 타입 안전성을 위해 사용
 */
export function extractTagNames(
  tags: (string | ApiTag)[] | undefined | null,
): string[] {
  if (!tags || tags.length === 0) {
    return [];
  }

  return tags.map((tag) => (typeof tag === 'string' ? tag : tag.name));
}

/**
 * 태그 객체에서 이름 추출 (단일 태그)
 */
export function getTagName(tag: string | ApiTag): string {
  return typeof tag === 'string' ? tag : tag.name;
}

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
