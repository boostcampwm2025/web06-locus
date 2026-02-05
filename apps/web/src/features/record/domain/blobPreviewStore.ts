import { create } from 'zustand';

/**
 * Blob Preview Store
 *
 * 기록 생성 직후 임시 미리보기 이미지 URL 관리
 * - 리사이징 완료 전까지 로컬 Blob URL을 캐시
 * - RecordImage 컴포넌트에서 사용
 */
interface BlobPreviewStore {
  /**
   * 기록별 Blob URL 저장소
   * key: recordPublicId
   * value: 모든 이미지의 Blob URL 배열
   */
  blobUrls: Map<string, string[]>;

  /**
   * Blob URL 배열 저장
   * @param recordId 기록 publicId
   * @param urls Blob URL 배열 (blob:http://...)
   */
  setBlobUrls: (recordId: string, urls: string[]) => void;

  /**
   * Blob URL 배열 조회
   * @param recordId 기록 publicId
   * @returns Blob URL 배열 (없으면 빈 배열)
   */
  getBlobUrls: (recordId: string) => string[];

  /**
   * 특정 기록의 Blob URL 정리
   * @param recordId 기록 publicId
   */
  cleanup: (recordId: string) => void;

  /**
   * 모든 Blob URL 정리 (메모리 해제)
   */
  cleanupAll: () => void;
}

const initialState = {
  blobUrls: new Map<string, string[]>(),
};

export const useBlobPreviewStore = create<BlobPreviewStore>((set, get) => ({
  ...initialState,

  setBlobUrls: (recordId, urls) => {
    set((state) => {
      const newMap = new Map(state.blobUrls);
      newMap.set(recordId, urls);
      return { blobUrls: newMap };
    });
  },

  getBlobUrls: (recordId) => {
    return get().blobUrls.get(recordId) ?? [];
  },

  cleanup: (recordId) => {
    const urls = get().blobUrls.get(recordId);
    urls?.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    set((state) => {
      const newMap = new Map(state.blobUrls);
      newMap.delete(recordId);
      return { blobUrls: newMap };
    });
  },

  cleanupAll: () => {
    const urlMap = get().blobUrls;
    urlMap.forEach((urls) => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    });

    set({ blobUrls: new Map() });
  },
}));
