import { useRef } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { useToast } from '../../shared/ui/toast';
import { isClientError, isServerError } from '../../shared/errors';

export function QueryClientWithToast({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();

  const queryClientRef = useRef(
    new QueryClient({
      /**
       * [QueryCache]: 모든 useQuery의 결과가 거쳐가는 중앙 통로
       */
      queryCache: new QueryCache({
        onError: (error) => {
          /**
           * Queries (조회) 에러 핸들링 전략
           * - 5xx 에러: throwOnError를 통해 ErrorBoundary로 위임되므로 여기서 처리하지 않음
           * - 4xx 및 기타 에러: 유저에게 즉각적인 피드백을 주기 위해 토스트 노출
           */
          if (isClientError(error)) {
            showToast(error.message, 'error');
          } else if (!isServerError(error)) {
            showToast(
              getErrorMessage(error, '알 수 없는 오류가 발생했습니다.'),
              'error',
            );
          }
        },
      }),

      /**
       * [MutationCache]: 모든 useMutation의 결과가 거쳐가는 중앙 통로
       */
      mutationCache: new MutationCache({
        onError: (error) => {
          /**
           * Mutations (조작) 에러 핸들링 전략
           * - 데이터 조작(가입, 수정 등) 중에는 서버 에러(5xx)가 발생하더라도
           * 화면 전체를 에러 페이지로 전환하지 않음. (유저가 입력한 폼 데이터 보호 목적)
           * - 모든 종류의 에러를 토스트로 알리고 현재 페이지 흐름을 유지함.
           */
          showToast(getErrorMessage(error, '처리에 실패했습니다.'), 'error');
        },
      }),

      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 5 * 60 * 1000,
          retry: (failureCount, error) => {
            // 명확한 클라이언트/서버 에러는 재시도가 의미 없으므로 즉시 중단
            if (isServerError(error) || isClientError(error)) return false;
            // 그 외 일시적인 네트워크 오류 등만 딱 1번 더 시도
            return failureCount < 1;
          },
          /**
           * 조회(Query) 시 5xx 에러가 발생하면 렌더링 단계에서 throw하여
           * 최상위 ErrorBoundary가 '에러 폴백 페이지'를 보여주도록 설정함.
           */
          throwOnError: (error) => isServerError(error),
        },
        mutations: {
          /**
           * Mutation은 에러가 발생해도 ErrorBoundary로 던지지 않음. (throwOnError: false)
           * 위 mutationCache에서 정의한 전역 토스트 핸들러만 작동하게 됨.
           */
          throwOnError: false,
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * 에러 객체에서 안전하게 메시지를 추출하는 헬퍼 함수
 */
const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};
