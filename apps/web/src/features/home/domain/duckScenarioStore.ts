import { create } from 'zustand';
import type {
  DuckScenario,
  DuckState,
  DuckPosition,
} from '@/shared/types/duck';
import { DEFAULT_DUCK_STATE } from '@/shared/types/duck';

interface DuckScenarioStore extends DuckState {
  setScenario: (
    type: DuckScenario,
    isVisible: boolean,
  ) => void /** 시나리오 타입과 노출 여부 설정 */;
  setVisible: (isVisible: boolean) => void /** 노출 여부만 변경 */;
  setTargetPath: (
    path: DuckPosition[],
  ) => void /** EXPLORING용 경로 설정. 오리가 순차적으로 걸어갈 좌표 배열 */;
  setAnchorPosition: (
    position: DuckPosition | null,
  ) => void /** GUARDING용 앵커(마커) 좌표 설정 */;
  setBounceLevel: (
    level: 'normal' | 'high',
  ) => void /** WELCOMING용 bounce 높이 (반갑게 맞이할 때 'high') */;
  updateState: (
    partial: Partial<DuckState>,
  ) => void /** 한 번에 여러 필드 갱신 */;
  /** 전체 초기화 (DEFAULT_DUCK_STATE). isVisible → false 이므로 오리가 사라짐. 지도 이탈·전체 정리 시 사용 */
  reset: () => void;
  /** 시나리오 타입·노출은 유지하고, targetPath·anchorPosition·bounceLevel만 기본값으로. 지도 진입 시 데이터만 정리할 때 사용 */
  resetData: () => void;
}

export const useDuckScenarioStore = create<DuckScenarioStore>((set) => ({
  ...DEFAULT_DUCK_STATE,

  setScenario: (type, isVisible) =>
    set((state) => ({
      type,
      isVisible,
      // 시나리오가 바뀌면 해당 시나리오에 맞지 않는 필드는 초기화
      targetPath: type === 'EXPLORING' ? state.targetPath : [],
      anchorPosition: type === 'GUARDING' ? state.anchorPosition : null,
    })),

  setVisible: (isVisible) => set({ isVisible }),

  setTargetPath: (targetPath) => set({ targetPath }),

  setAnchorPosition: (anchorPosition) => set({ anchorPosition }),

  setBounceLevel: (bounceLevel) => set({ bounceLevel }),

  updateState: (partial) => set(partial),

  reset: () => set(DEFAULT_DUCK_STATE),

  resetData: () =>
    set({
      targetPath: [],
      anchorPosition: null,
      bounceLevel: 'normal',
    }),
}));
