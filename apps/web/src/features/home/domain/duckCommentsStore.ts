import { create } from 'zustand';
import { getDuckComments } from '@/infra/api/services/duckService';

/** 기록 5개마다 메시지가 바뀌므로 초기 진입·기록 생성 시 호출 */
interface DuckCommentsStore {
  comments: string[];
  setComments: (comments: string[]) => void;
  refreshComments: () => Promise<void>;
}

export const useDuckCommentsStore = create<DuckCommentsStore>((set) => ({
  comments: [],

  setComments: (comments) => set({ comments }),

  refreshComments: async () => {
    try {
      const comments = await getDuckComments();
      set({ comments });
    } catch {
      set({ comments: [] });
    }
  },
}));
