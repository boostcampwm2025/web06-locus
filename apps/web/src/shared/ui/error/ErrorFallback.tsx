import type { FallbackProps } from 'react-error-boundary';
import { ErrorIcon, RefreshIcon } from '@/shared/icons/Icons';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 배경 블러 */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/20" />

      {/* 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-gray-300 flex items-center justify-center bg-white">
            <ErrorIcon className="w-8 h-8 text-gray-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            일시적인 문제가 발생했어요
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            잠시 후 다시 시도해 주세요
          </p>

          <button
            onClick={resetErrorBoundary}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-4xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
          >
            <RefreshIcon className="w-5 h-5 text-white" />
            다시 시도
          </button>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {import.meta.env.DEV && error && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer">
                에러 상세 정보
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
