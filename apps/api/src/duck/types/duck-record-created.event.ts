/**
 * 오리 코멘트 갱신용 이벤트
 * - ES 동기화 이벤트(record.sync)와 별도 큐로 전달되는, 기록 생성 신호
 * - eventId는 Outbox ID: 같은 이벤트가 여러 번 전달돼도 한 번만 처리하는 멱등 키
 */
export interface DuckRecordCreatedEvent {
  eventId: string;
  userId: string;
  recordId: string;
}
