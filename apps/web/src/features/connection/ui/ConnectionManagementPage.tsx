import { useState, useMemo, useEffect } from 'react';
import BackHeader from '@/shared/ui/header/BackHeader';
import BaseRecordSection from './BaseRecordSection';
import ConnectionSearchInput from './ConnectionSearchInput';
import ConnectionMapVisualization from './ConnectionMapVisualization';
import ConnectedRecordList from './ConnectedRecordList';
import type { ConnectionManagementPageProps } from '../types/connectionManagement';
import { useDebounce } from '@/shared/hooks/useDebounce';

/**
 * 연결 관리 페이지 메인 컴포넌트
 */
export default function ConnectionManagementPage({
  baseRecord,
  connectedRecords,
  onBack,
  onSearchChange,
  onRecordRemove,
  onRecordClick,
  className = '',
}: ConnectionManagementPageProps) {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // 디바운스된 검색어가 변경될 때만 onSearchChange 호출
  useEffect(() => {
    onSearchChange?.(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange]);

  // 검색 필터링된 기록 목록 (디바운스된 검색어 사용)
  const filteredRecords = useMemo(() => {
    if (!debouncedSearchValue.trim()) {
      return connectedRecords;
    }

    const query = debouncedSearchValue.toLowerCase();
    return connectedRecords.filter(
      (record) =>
        record.title.toLowerCase().includes(query) ||
        record.location?.name.toLowerCase().includes(query) ||
        record.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [connectedRecords, debouncedSearchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <BackHeader title="연결 관리" onBack={onBack} />
      <BaseRecordSection record={baseRecord} />
      <div className="px-4 py-4 space-y-4">
        <ConnectionSearchInput
          value={searchValue}
          onChange={handleSearchChange}
        />
        <ConnectionMapVisualization
          connectionCount={baseRecord.connectionCount}
        />
        <ConnectedRecordList
          records={filteredRecords}
          onRecordRemove={onRecordRemove}
          onRecordClick={onRecordClick}
          showEmptyMessage={debouncedSearchValue.trim().length > 0}
        />
      </div>
    </div>
  );
}
