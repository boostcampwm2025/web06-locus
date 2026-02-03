import { useMemo, useState } from 'react';
import { PinMarkerPendingIcon } from '@/shared/ui/icons/PinMarkerPendingIcon';
import { PinMarkerCompletedIcon } from '@/shared/ui/icons/PinMarkerCompletedIcon';
import type { PinMarkerProps } from '@/shared/types/marker';
import './markerAnimations.css';

export default function PinMarker({
  pin,
  isSelected = false,
  onClick,
}: PinMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isCurrent = pin.variant === 'current';
  const isRecord = pin.variant === 'record';
  const isCluster = pin.variant === 'cluster';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 지도 클릭 이벤트 전파 방지
    onClick?.(pin.id);
  };

  const rootClassName = useMemo(() => {
    const classes = [
      'pin-marker',
      'relative',
      'select-none',
      'cursor-pointer',
      'transition-transform',
      'duration-150',
    ];

    const isCurrentIdle = isCurrent && !isSelected;
    const isRecordHovered = (isRecord || isCluster) && !isSelected && isHovered;
    const selectedClassName = isCurrent
      ? 'pin-blue-selected'
      : 'pin-purple-selected';

    if (isCurrentIdle) classes.push('pin-blue-idle');
    if (isSelected) classes.push(selectedClassName);

    // 보라색/클러스터 핀 hover 시 살짝 반응 (데스크톱 전용)
    if (isRecordHovered) classes.push('pin-purple-hover');

    return classes.join(' ');
  }, [isCurrent, isRecord, isCluster, isHovered, isSelected]);

  return (
    <div
      className={rootClassName}
      onClick={handleClick}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      role="button"
      tabIndex={0}
      aria-label={`핀마커 ${String(pin.id)}`}
      aria-pressed={isSelected}
    >
      {/* 아이콘 래퍼 */}
      <div className="pin-motion-wrap">
        <div className={`pin-pulse-wrap ${isCurrent ? 'pin-blue-pulse' : ''}`}>
          {isCurrent ? (
            <PinMarkerPendingIcon className="w-10 h-14" />
          ) : (
            <PinMarkerCompletedIcon className="w-10 h-14" />
          )}

          {/* 클러스터 핀: 개수 뱃지 */}
          {isCluster && pin.count != null && pin.count > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold shadow-sm"
              aria-label={`${pin.count}개 기록`}
            >
              {pin.count > 99 ? '99+' : pin.count}
            </span>
          )}

          {/* 보라 선택 시 스윕 (단일 기록 또는 클러스터) */}
          {(isRecord || isCluster) && isSelected && (
            <span className="pin-sweep" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
