import { useConnectionStore } from './connectionStore';

/**
 * 기록 연결 기능을 위한 도메인 훅
 * connectionStore를 래핑하여 기존 API와의 호환성 유지
 */
export function useRecordConnection() {
  const departure = useConnectionStore((state) => state.departure);
  const arrival = useConnectionStore((state) => state.arrival);
  const searchQuery = useConnectionStore((state) => state.searchQuery);
  const pendingRecord = useConnectionStore((state) => state.pendingRecord);
  const selectDeparture = useConnectionStore((state) => state.selectDeparture);
  const selectArrival = useConnectionStore((state) => state.selectArrival);
  const clearDeparture = useConnectionStore((state) => state.clearDeparture);
  const clearArrival = useConnectionStore((state) => state.clearArrival);
  const handleRecordClick = useConnectionStore(
    (state) => state.handleRecordClick,
  );
  const closeContextMenu = useConnectionStore(
    (state) => state.closeContextMenu,
  );
  const updateSearchQuery = useConnectionStore(
    (state) => state.updateSearchQuery,
  );
  const connect = useConnectionStore((state) => state.connect);

  // 연결하기 버튼 활성화 여부
  const isConnectEnabled = Boolean(departure && arrival);

  return {
    // 상태
    departure,
    arrival,
    searchQuery,
    isConnectEnabled,
    pendingRecord,

    // 액션
    selectDeparture,
    selectArrival,
    clearDeparture,
    clearArrival,
    handleRecordClick,
    closeContextMenu,
    updateSearchQuery,
    connect,
  };
}
