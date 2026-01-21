export default function MapLoadingSkeleton() {
  return (
    <div className="flex-1 relative bg-gray-100 animate-pulse">
      {/* 지도 로딩 스켈레톤 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full animate-pulse" />
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      </div>
    </div>
  );
}
