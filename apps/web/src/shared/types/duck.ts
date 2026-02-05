/**
 * 오리 출몰 시나리오 타입
 *
 * - IDLE: 기본/대기. 고독한 여행자(기록 없는 곳 1분 체류 시 구석→중앙) 등
 * - WELCOMING: 반가운 마중 (첫 진입 시 마지막 위치 근처, 높은 bounce)
 * - EXPLORING: 추억의 탐험가 (기록 사이를 walkAlongPath로 산책)
 * - GUARDING: 기억의 수호자 (마커 주변 출몰, 정지 또는 작은 반경 뱅글뱅글)
 */
export type DuckScenario = 'IDLE' | 'WELCOMING' | 'EXPLORING' | 'GUARDING';

/** 픽셀 좌표 (지도/뷰포트 기준) */
export interface DuckPosition {
  x: number;
  y: number;
}

/**
 * 오리 시나리오 상태
 * 시나리오 타입, 노출 여부, 경로(EXPLORING 시) 등을 담습니다.
 */
export interface DuckState {
  type: DuckScenario /** 현재 시나리오 */;
  isVisible: boolean /** 오리 노출 여부 */;
  targetPath: DuckPosition[] /** EXPLORING 시 사용. 순차적으로 걸어갈 좌표 배열 (첫 마커 → ... → 마지막 마커) */;
  anchorPosition: DuckPosition | null /** GUARDING 시 사용. 수호할 마커(기록)의 화면 좌표. 이 점 근처에 출몰 */;
  bounceLevel:
    | 'normal'
    | 'high' /** WELCOMING 시 사용. 반갑게 맞이할 때 bounce 높이. 'normal' | 'high' */;
}

export const DEFAULT_DUCK_STATE: DuckState = {
  type: 'IDLE',
  isVisible: false,
  targetPath: [],
  anchorPosition: null,
  bounceLevel: 'normal',
};
