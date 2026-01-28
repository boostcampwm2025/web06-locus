import { useMemo } from 'react';
import type { RecordConnectionItem } from '../types/recordConnection';
import { useCreateConnection } from './useCreateConnection';
// TODO: API 연동 - 기록 검색 API 사용
import { addStoredConnection } from '@/infra/storage/connectionStorage';

interface UseRecordConnectionPageOptions {
  searchQuery: string;
  isConnectEnabled: boolean;
  connect: () => { departureId: string; arrivalId: string } | null;
  onConnect?: (departureId: string, arrivalId: string) => void;
}

/**
 * 기록 연결 페이지의 비즈니스 로직을 관리하는 훅
 */
export function useRecordConnectionPage({
  searchQuery,
  isConnectEnabled,
  connect,
  onConnect,
}: UseRecordConnectionPageOptions) {
  const createConnectionMutation = useCreateConnection();

  // TODO: API 연동 - 기록 검색 API 사용
  // 현재는 빈 배열 반환 (API 연동 전까지)
  const trimmedQuery = searchQuery.trim();
  const recordsWithRelatedTag = useMemo<RecordConnectionItem[]>(() => {
    // TODO: GET /records/search API 호출하여 기록 목록 가져오기
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery]);

  // 빈 상태 메시지
  const emptyMessage = trimmedQuery
    ? '검색 결과가 없습니다'
    : '추천 기록이 없습니다';

  // 연결 생성 핸들러
  const handleConnect = async () => {
    if (!isConnectEnabled) return;

    const result = connect();
    if (!result) return;

    try {
      // API로 연결 생성
      const response = await createConnectionMutation.mutateAsync({
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
      });

      // 성공 시 localStorage에도 저장
      addStoredConnection({
        publicId: response.data.connection.publicId,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: response.data.connection.createdAt,
      });

      // 성공 시 콜백 호출
      onConnect?.(result.departureId, result.arrivalId);
    } catch (error) {
      // API 실패 시에도 localStorage에 저장하여 시연 가능하도록 (시연 이후 제거)
      console.error('연결 생성 실패 (로컬 저장으로 대체):', error);

      addStoredConnection({
        publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromRecordPublicId: result.departureId,
        toRecordPublicId: result.arrivalId,
        createdAt: new Date().toISOString(),
      });

      // 시각적으로 연결 표시를 위해 콜백 호출
      onConnect?.(result.departureId, result.arrivalId);
    }
  };

  // 연결 버튼 활성화 상태
  const isConnectButtonEnabled =
    isConnectEnabled && !createConnectionMutation.isPending;

  return {
    recordsWithRelatedTag,
    emptyMessage,
    handleConnect,
    isConnectButtonEnabled,
    isConnecting: createConnectionMutation.isPending,
  };
}
