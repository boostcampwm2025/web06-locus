import type { Record, SearchRecordItem } from '@locus/shared';

/**
 * 기록 정렬 기준
 * - 즐겨찾기 우선 (true가 먼저)
 * - 그 다음 생성일 (최신순)
 */
export function sortRecordsByFavorite<T extends Record | SearchRecordItem>(
  records: T[],
): T[] {
  return [...records].sort((a, b) => {
    // 즐겨찾기 우선 정렬
    const aFavorite = 'isFavorite' in a ? (a.isFavorite ?? false) : false;
    const bFavorite = 'isFavorite' in b ? (b.isFavorite ?? false) : false;

    if (aFavorite !== bFavorite) {
      // 즐겨찾기가 true인 항목이 먼저 오도록
      return aFavorite ? -1 : 1;
    }

    // 즐겨찾기 상태가 같으면 생성일 기준 정렬 (최신순)
    // Record 타입: createdAt 사용
    let aDate: number;
    let bDate: number;

    if ('createdAt' in a && typeof a.createdAt === 'string') {
      aDate = new Date(a.createdAt).getTime();
    } else if ('date' in a && typeof a.date === 'string') {
      aDate = new Date(a.date).getTime();
    } else {
      aDate = 0;
    }

    if ('createdAt' in b && typeof b.createdAt === 'string') {
      bDate = new Date(b.createdAt).getTime();
    } else if ('date' in b && typeof b.date === 'string') {
      bDate = new Date(b.date).getTime();
    } else {
      bDate = 0;
    }

    return bDate - aDate; // 내림차순 (최신순)
  });
}
