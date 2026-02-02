import { useMemo } from 'react';
import {
  getDuckAssetIndex,
  getDuckAssetPath,
} from '@/shared/utils/duckAssetUtils';

/**
 * 각도(degree)에 맞는 duck-walk 에셋의 public URL을 반환합니다.
 * 이동 방향 등 조건에 따라 각도만 바꿔 주면 해당 방향 스프라이트가 나오도록 할 때 사용합니다.
 *
 * @param angle - 바라보는 방향 각도 (0 = 동, 90 = 남, 180 = 서, 270 = 북)
 * @returns 해당 방향 duck-walk gif의 public URL
 *
 * @example
 * const url = useDuckAsset(90); // 남쪽 걷는 오리
 * return <img src={url} alt="duck" />;
 */
export function useDuckAsset(angle: number): string {
  return useMemo(() => {
    const index = getDuckAssetIndex(angle);
    return getDuckAssetPath(index);
  }, [angle]);
}

/**
 * 에셋 인덱스(0~7)에 맞는 duck-walk 에셋의 public URL을 반환합니다.
 * 특정 번호를 지정해서 그 방향 오리를 보여줄 때 사용합니다.
 *
 * @param index - 에셋 인덱스 0~7
 * @returns 해당 인덱스 duck-walk gif의 public URL
 */
export function useDuckAssetByIndex(index: number): string {
  return useMemo(() => getDuckAssetPath(index), [index]);
}
