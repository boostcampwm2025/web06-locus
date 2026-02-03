/**
 * duck-walk 에셋 방향 인덱스 (360°를 8등분, 45°씩)
 * 0: 동(east), 1: 남동(south-east), 2: 남(south), 3: 남서(south-west),
 * 4: 서(west), 5: 북서(north-west), 6: 북(north), 7: 북동(north-east)
 */
export const DUCK_WALK_INDEX_TO_FILENAME: Record<number, string> = {
  0: 'duck-walk_east.gif',
  1: 'duck-walk_south-east.gif',
  2: 'duck-walk_south.gif',
  3: 'duck-walk_south-west.gif',
  4: 'duck-walk_west.gif',
  // 5: north-west, 6: north — 에셋 없음, 인접 방향으로 폴백
  5: 'duck-walk_west.gif',
  6: 'duck-walk_north-east.gif',
  7: 'duck-walk_north-east.gif',
} as const;

export const DUCK_WALK_INDEX_COUNT = 8;

/**
 * 각도(degree, 0~360)를 duck-walk 에셋 인덱스(0~7)로 변환합니다.
 * 360°를 8등분(45°씩)하여 방향 인덱스를 반환합니다.
 *
 * @param angle - 바라보는 방향 각도 (0 = 동, 90 = 남, 180 = 서, 270 = 북)
 * @returns 에셋 인덱스 0~7
 *
 * @example
 * getDuckAssetIndex(0)   // 0 (동)
 * getDuckAssetIndex(90)  // 2 (남)
 * getDuckAssetIndex(180) // 4 (서)
 */
export function getDuckAssetIndex(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return index;
}

/**
 * duck-walk 에셋 인덱스(0~7)에 해당하는 public URL 경로를 반환합니다.
 *
 * @param index - 에셋 인덱스 0~7
 * @returns public 기준 경로 (예: "/duck-walk_east.gif")
 */
export function getDuckAssetPath(index: number): string {
  const safeIndex = ((index % 8) + 8) % 8;
  const filename = DUCK_WALK_INDEX_TO_FILENAME[safeIndex];
  return `/${filename}`;
}
