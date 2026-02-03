import type { DuckScenario } from '@/shared/types/duck';

/**
 * 오리 시나리오별 "조건 만족 시 노출할지" 확률 (0~1).
 * 해당 시나리오 조건이 만족될 때 Math.random() < PROBABILITY[시나리오] 로 노출 여부 결정.
 */
export const DUCK_SCENARIO_PROBABILITY: Record<DuckScenario, number> = {
  GUARDING: 0.3, // 마커 1개 이상일 때 30% 확률로 출몰
  EXPLORING: 0.25, // 최근 3일 기록 2개 이상일 때 25%
  WELCOMING: 0.4, // 첫 진입 시 40%
  IDLE: 0.2, // 빈 뷰포트 1분 시 20%
} as const;

/**
 * 오리 시나리오별 가중치. 여러 시나리오가 동시에 후보일 때 가중치 비율로 하나 선택.
 * 예: 후보가 [GUARDING, EXPLORING] 이면 30 : 25 비율로 선택.
 */
export const DUCK_SCENARIO_WEIGHTS: Record<DuckScenario, number> = {
  GUARDING: 30,
  EXPLORING: 25,
  WELCOMING: 40,
  IDLE: 20,
} as const;

const SCENARIOS: DuckScenario[] = [
  'GUARDING',
  'EXPLORING',
  'WELCOMING',
  'IDLE',
];

/**
 * 후보 시나리오 목록과 가중치로 가중 랜덤 선택.
 * @param eligible - 조건을 만족한 시나리오 배열 (비어 있으면 null)
 * @param weights - 시나리오별 가중치 (기본 DUCK_SCENARIO_WEIGHTS)
 * @returns 선택된 시나리오 또는 null (eligible 비어 있으면 null)
 */
export function pickScenarioByWeight(
  eligible: DuckScenario[],
  weights: Record<DuckScenario, number> = DUCK_SCENARIO_WEIGHTS,
): DuckScenario | null {
  if (eligible.length === 0) return null;
  if (eligible.length === 1) return eligible[0];

  const total = eligible.reduce((sum, s) => sum + weights[s], 0);
  let r = Math.random() * total;

  for (const s of eligible) {
    r -= weights[s];
    if (r <= 0) return s;
  }

  return eligible[eligible.length - 1];
}

/**
 * 해당 시나리오가 확률에 따라 노출할지 여부.
 * @param scenario - 시나리오
 * @param probability - 시나리오별 확률 (기본 DUCK_SCENARIO_PROBABILITY)
 * @returns true면 노출
 */
export function shouldShowScenario(
  scenario: DuckScenario,
  probability: Record<DuckScenario, number> = DUCK_SCENARIO_PROBABILITY,
): boolean {
  return Math.random() < probability[scenario];
}

export { SCENARIOS };
