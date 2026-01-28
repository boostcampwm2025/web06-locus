import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRecordFavorite } from '@/infra/api/services/recordService';
import type { RecordDetail, Record, SearchRecordItem } from '@locus/shared';
import { sortRecordsByFavorite } from '@/shared/utils/recordSortUtils';
import type { UpdateRecordFavoriteParams, RecordsData } from '../types';

/**
 * 기록 즐겨찾기 변경 React Query Hook
 * - 낙관적 업데이트 적용: 서버 응답 전에 UI 즉시 업데이트
 * - 부분 캐시 업데이트: 불필요한 refetch 방지로 성능 최적화
 */
export function useUpdateRecordFavorite() {
  const queryClient = useQueryClient();

  // 목록 캐시(records) 내 특정 아이템을 업데이트하고 재정렬하는 공통 함수
  const updateRecordsCache = (publicId: string, isFavorite: boolean) => {
    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['records'] })
      .forEach((query) => {
        queryClient.setQueryData(query.queryKey, (oldData: unknown) => {
          if (
            !oldData ||
            typeof oldData !== 'object' ||
            !('records' in oldData) ||
            !Array.isArray(oldData.records)
          ) {
            return oldData;
          }

          const updatedRecords = oldData.records.map(
            (
              record:
                | Record
                | SearchRecordItem
                | {
                    publicId?: string;
                    isFavorite?: boolean;
                    [key: string]: unknown;
                  },
            ) => {
              if (
                record &&
                typeof record === 'object' &&
                'publicId' in record &&
                record.publicId === publicId
              ) {
                // isFavorite 필드만 업데이트
                return { ...record, isFavorite };
              }

              return record;
            },
          );

          return {
            ...oldData,
            // RecordWithoutCoords도 처리 가능 (isFavorite, createdAt 필드만 사용)
            records: sortRecordsByFavorite(updatedRecords),
          };
        });
      });
  };

  return useMutation<
    { publicId: string; isFavorite: boolean },
    Error,
    UpdateRecordFavoriteParams,
    {
      previousDetailData: RecordDetail | undefined;
      previousRecordsData: Map<string, RecordsData>;
    }
  >({
    mutationFn: ({ publicId, isFavorite }) =>
      updateRecordFavorite(publicId, isFavorite),

    // 낙관적 업데이트: 서버 응답 전에 UI 즉시 업데이트
    onMutate: async ({ publicId, isFavorite }) => {
      await queryClient.cancelQueries({
        queryKey: ['record', 'detail', publicId],
      });
      await queryClient.cancelQueries({ queryKey: ['records'] });

      const previousDetailData = queryClient.getQueryData<RecordDetail>([
        'record',
        'detail',
        publicId,
      ]);
      const previousRecordsData = new Map<string, RecordsData>();

      // 모든 records 쿼리의 이전 데이터 백업 (롤백용)
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['records'] })
        .forEach((query) => {
          if (query.state.data) {
            previousRecordsData.set(
              query.queryHash,
              query.state.data as RecordsData,
            );
          }
        });

      // 상세 조회 캐시 낙관적 업데이트
      queryClient.setQueryData<RecordDetail>(
        ['record', 'detail', publicId],
        (old) => (old ? { ...old, isFavorite } : old),
      );

      // 목록 캐시 낙관적 업데이트 (부분 업데이트)
      updateRecordsCache(publicId, isFavorite);

      return { previousDetailData, previousRecordsData };
    },

    onSuccess: (data, variables) => {
      // 상세 조회 캐시 최종 업데이트
      queryClient.setQueryData<RecordDetail>(
        ['record', 'detail', variables.publicId],
        (old) => (old ? { ...old, isFavorite: data.isFavorite } : old),
      );

      // 목록 캐시 최종 업데이트 (서버 응답으로 확인)
      updateRecordsCache(variables.publicId, data.isFavorite);
    },

    // 실패 시: 이전 상태로 롤백
    onError: (_error, variables, context) => {
      if (!context) return;

      if (context.previousDetailData) {
        queryClient.setQueryData(
          ['record', 'detail', variables.publicId],
          context.previousDetailData,
        );
      }

      // 목록 캐시 롤백
      context.previousRecordsData.forEach((data, queryHash) => {
        const query = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['records'] })
          .find((q) => q.queryHash === queryHash);
        if (query) queryClient.setQueryData(query.queryKey, data);
      });
    },

    // 완료 시: 진행 중인 쿼리 재시도
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['record', 'detail', variables.publicId],
      });
      // 목록은 부분 업데이트로 처리했으므로 무효화하지 않음
    },
  });
}
