import { useState } from 'react';
import type {
  RecordSelection,
  RecordConnectionItem,
} from '../types/recordConnection';

/**
 * 기록 연결 기능을 위한 도메인 훅
 */
export function useRecordConnection() {
  const [departure, setDeparture] = useState<RecordSelection | undefined>(
    undefined,
  );
  const [arrival, setArrival] = useState<RecordSelection | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRecord, setPendingRecord] =
    useState<RecordConnectionItem | null>(null);

  // 연결하기 버튼 활성화 여부 (가벼운 계산이므로 useMemo 불필요)
  const isConnectEnabled = Boolean(departure && arrival);

  const selectDeparture = (record: RecordConnectionItem) => {
    setDeparture({
      id: record.id,
      title: record.title,
      location: record.location,
    });
  };

  const selectArrival = (record: RecordConnectionItem) => {
    setArrival({
      id: record.id,
      title: record.title,
      location: record.location,
    });
  };

  const clearDeparture = () => setDeparture(undefined);
  const clearArrival = () => setArrival(undefined);

  /**
   * 기록 클릭 처리
   * - 둘 다 미선택: 컨텍스트 메뉴
   * - 하나만 선택: 남은 항목 자동 채우기
   * - 둘 다 선택: 재선택을 위해 컨텍스트 메뉴로 유도
   */
  const handleRecordClick = (record: RecordConnectionItem) => {
    const isBothSelected = departure && arrival;
    const isBothUnselected = !departure && !arrival;
    const isOnlyDepartureSelected = departure && !arrival;
    const isOnlyArrivalSelected = !departure && arrival;

    // 둘 다 선택되었거나 둘 다 선택되지 않은 경우: 컨텍스트 메뉴 표시
    if (isBothSelected || isBothUnselected) {
      setPendingRecord(record);
      return;
    }

    // 출발만 선택된 경우: 도착 자동 선택
    if (isOnlyDepartureSelected) {
      // 이미 출발로 선택된 기록을 도착으로 중복 선택하는 경우 방지
      if (departure.id === record.id) {
        setPendingRecord(record);
        return;
      }
      selectArrival(record);
      return;
    }

    // 도착만 선택된 경우: 출발 자동 선택
    if (isOnlyArrivalSelected) {
      // 이미 도착으로 선택된 기록을 출발로 중복 선택하는 경우 방지
      if (arrival.id === record.id) {
        setPendingRecord(record);
        return;
      }
      selectDeparture(record);
    }
  };

  const closeContextMenu = () => setPendingRecord(null);

  const updateSearchQuery = (query: string) => setSearchQuery(query);

  /**
   * 연결 실행
   * - throw 대신 null 반환(UI에서 안전하게 처리)
   */
  const connect = () => {
    if (!departure || !arrival) return null;
    return { departureId: departure.id, arrivalId: arrival.id };
  };

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
