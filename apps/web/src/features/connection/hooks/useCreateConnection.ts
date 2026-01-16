import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createConnection } from '@/infra/api/services/connectionService';
import type { CreateConnectionRequest } from '@/infra/types/connection';

/**
 * 연결 생성 훅
 */
export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateConnectionRequest) => createConnection(request),
    onSuccess: () => {
      // 연결 생성 후 관련 쿼리 무효화
      void queryClient.invalidateQueries({ queryKey: ['records'] });
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      void queryClient.invalidateQueries({ queryKey: ['record-graph'] });
    },
  });
}
