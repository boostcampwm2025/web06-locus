import { useMemo, useState } from 'react';
import PinMarkerPendingIcon from '@/shared/icons/PinMarkerPendingIcon';
import PinMarkerCompletedIcon from '@/shared/icons/PinMarkerCompletedIcon';
import type { PinMarkerProps } from '@/shared/types/marker';
import './marker-animations.css';

export default function PinMarker({
  pin,
  isSelected = false,
  onClick,
}: PinMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isCurrent = pin.variant === 'current';
  const isRecord = pin.variant === 'record';

  const handleClick = () => onClick?.(pin.id);

  const rootClassName = useMemo(() => {
    const classes = [
      'pin-marker',
      'relative',
      'select-none',
      'cursor-pointer',
      'transition-transform',
      'duration-150',
    ];

    if (isCurrent && !isSelected) classes.push('pin-blue-idle');

    if (isSelected)
      classes.push(isCurrent ? 'pin-blue-selected' : 'pin-purple-selected');

    // 보라색 핀 hover 시 살짝 반응 (데스크톱 전용)
    if (isRecord && !isSelected && isHovered) classes.push('pin-purple-hover');

    return classes.join(' ');
  }, [isCurrent, isRecord, isHovered, isSelected]);

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
            <PinMarkerPendingIcon className="w-14 h-20" />
          ) : (
            <PinMarkerCompletedIcon className="w-14 h-20" />
          )}

          {/* 보라 선택 시 스윕 */}
          {isRecord && isSelected && (
            <span className="pin-sweep" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
