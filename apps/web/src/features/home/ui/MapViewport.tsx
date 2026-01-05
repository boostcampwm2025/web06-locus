import type { MapViewportProps } from '@features/home/types/map-viewport.types';

export default function MapViewport({ className = '' }: MapViewportProps) {
  return (
    <div
      className={`relative flex-1 bg-gray-100 ${className}`}
      aria-label="지도 영역"
    >
      {/* 지도 영역 - 실제 지도 SDK가 들어갈 공간 */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-green-50 to-yellow-50">
        {/* 지도 배경 시뮬레이션 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-green-200 rounded-full blur-3xl" />
        </div>
      </div>
      {/* Floating Action Button */}
      <button
        type="button"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 z-10"
        aria-label="연결 모드"
      >
        연결 모드
      </button>
    </div>
  );
}
