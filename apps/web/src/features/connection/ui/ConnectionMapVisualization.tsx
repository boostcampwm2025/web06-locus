import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import type { ConnectionMapVisualizationProps } from '../types/connectionManagement';

/**
 * 연결 관계 지도 시각화 플레이스홀더 컴포넌트
 * 추후 d3를 사용하여 실제 시각화를 구현할 예정
 */
export default function ConnectionMapVisualization({
  connectionCount,
  className = '',
}: ConnectionMapVisualizationProps) {
  return (
    <div
      className={`bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] ${className}`}
    >
      <MapPinIcon className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-base font-medium text-gray-700 mb-2">
        연결 관계 지도 시각화
      </h3>
      <p className="text-sm text-gray-500">{connectionCount}개 기록과 연결됨</p>
    </div>
  );
}
