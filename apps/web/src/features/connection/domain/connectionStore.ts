import { create } from 'zustand';
import type {
  RecordSelection,
  RecordConnectionItem,
} from '../types/recordConnection';

interface ConnectionStore {
  // 연결 모드 플래그
  connectionFromRecordId: string | null;

  // 연결 상태
  departure: RecordSelection | undefined;
  arrival: RecordSelection | undefined;
  searchQuery: string;
  pendingRecord: RecordConnectionItem | null;

  // 연결 모드 제어
  startConnection: (fromRecordId: string) => void;
  cancelConnection: () => void;

  // 연결 상태 관리
  selectDeparture: (record: RecordConnectionItem) => void;
  selectArrival: (record: RecordConnectionItem) => void;
  clearDeparture: () => void;
  clearArrival: () => void;
  updateSearchQuery: (query: string) => void;
  setPendingRecord: (record: RecordConnectionItem | null) => void;
  closeContextMenu: () => void;

  // 기록 클릭 처리
  handleRecordClick: (record: RecordConnectionItem) => void;

  // 연결 실행
  connect: () => { departureId: string; arrivalId: string } | null;

  // 전체 초기화
  reset: () => void;
}

const initialState = {
  connectionFromRecordId: null,
  departure: undefined,
  arrival: undefined,
  searchQuery: '',
  pendingRecord: null,
};

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  ...initialState,

  // 연결 모드 제어
  startConnection: (fromRecordId: string) => {
    set({ connectionFromRecordId: fromRecordId });
  },

  cancelConnection: () => {
    set({
      connectionFromRecordId: null,
      departure: undefined,
      arrival: undefined,
      searchQuery: '',
      pendingRecord: null,
    });
  },

  // 연결 상태 관리
  selectDeparture: (record: RecordConnectionItem) => {
    set({
      departure: {
        id: record.id,
        title: record.title,
        location: record.location,
      },
    });
  },

  selectArrival: (record: RecordConnectionItem) => {
    set({
      arrival: {
        id: record.id,
        title: record.title,
        location: record.location,
      },
    });
  },

  clearDeparture: () => {
    set({ departure: undefined });
  },

  clearArrival: () => {
    set({ arrival: undefined });
  },

  updateSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setPendingRecord: (record: RecordConnectionItem | null) => {
    set({ pendingRecord: record });
  },

  closeContextMenu: () => {
    set({ pendingRecord: null });
  },

  // 기록 클릭 처리
  handleRecordClick: (record: RecordConnectionItem) => {
    const { departure, arrival } = get();
    const isBothSelected = departure && arrival;
    const isBothUnselected = !departure && !arrival;
    const isOnlyDepartureSelected = departure && !arrival;
    const isOnlyArrivalSelected = !departure && arrival;

    // 둘 다 선택되었거나 둘 다 선택되지 않은 경우: 컨텍스트 메뉴 표시
    if (isBothSelected || isBothUnselected) {
      set({ pendingRecord: record });
      return;
    }

    // 출발만 선택된 경우: 도착 자동 선택
    if (isOnlyDepartureSelected) {
      // 이미 출발로 선택된 기록을 도착으로 중복 선택하는 경우 방지
      if (departure.id === record.id) {
        set({ pendingRecord: record });
        return;
      }
      get().selectArrival(record);
      return;
    }

    // 도착만 선택된 경우: 출발 자동 선택
    if (isOnlyArrivalSelected) {
      // 이미 도착으로 선택된 기록을 출발로 중복 선택하는 경우 방지
      if (arrival.id === record.id) {
        set({ pendingRecord: record });
        return;
      }
      get().selectDeparture(record);
    }
  },

  // 연결 실행
  connect: () => {
    const { departure, arrival } = get();
    if (!departure || !arrival) return null;
    return { departureId: departure.id, arrivalId: arrival.id };
  },

  // 전체 초기화
  reset: () => {
    set(initialState);
  },
}));
