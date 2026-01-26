import ConnectedRecordCard from './ConnectedRecordCard';
import type { ConnectedRecordListProps } from '../types/connectionManagement';

/**
 * 연결된 기록 목록 헤더
 */
function ConnectedRecordListHeader({ count }: { count: number }) {
  return (
    <h2 className="text-base font-semibold text-gray-900 mb-3">
      연결된 기록 {count}개
    </h2>
  );
}

/**
 * 검색 결과 없음 컴포넌트
 */
function EmptySearchResult() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
    </div>
  );
}

/**
 * 연결된 기록 목록 컴포넌트
 */
export default function ConnectedRecordList({
  records,
  onRecordRemove,
  onRecordClick,
  showEmptyMessage = false,
  className = '',
}: ConnectedRecordListProps) {
  // 검색 결과가 없고 빈 메시지를 표시해야 하는 경우
  if (records.length === 0 && showEmptyMessage) {
    return (
      <section className={className}>
        <EmptySearchResult />
      </section>
    );
  }

  // 검색 결과가 없지만 빈 메시지를 표시하지 않는 경우 (초기 상태)
  if (records.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <ConnectedRecordListHeader count={records.length} />
      <div className="flex flex-col gap-3">
        {records.map((record) => (
          <ConnectedRecordCard
            key={record.id}
            record={record}
            onRemove={onRecordRemove}
            onClick={onRecordClick}
          />
        ))}
      </div>
    </section>
  );
}
