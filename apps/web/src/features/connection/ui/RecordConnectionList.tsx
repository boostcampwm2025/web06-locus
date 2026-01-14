import type { RecordConnectionListProps } from '../types/recordConnection';
import RecordConnectionCard from './RecordConnectionCard';

/**
 * 기록 연결 리스트 컴포넌트
 */
export default function RecordConnectionList({
  records,
  onRecordClick,
  emptyMessage = '기록이 없습니다',
  className = '',
}: RecordConnectionListProps) {
  if (records.length === 0) {
    return (
      <div
        className={`px-4 py-12 text-center text-sm text-gray-500 ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-0 border-t border-gray-200 ${className}`}>
      {records.map((record) => (
        <RecordConnectionCard
          key={record.id}
          record={record}
          onClick={() => onRecordClick?.(record)}
        />
      ))}
    </div>
  );
}
