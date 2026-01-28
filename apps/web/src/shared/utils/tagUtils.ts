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
