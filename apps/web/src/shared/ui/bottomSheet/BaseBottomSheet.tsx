import { useBottomSheet } from '@/shared/hooks/useBottomSheet';
import type { BaseBottomSheetProps } from '@/shared/types/bottomSheet';

const HEIGHT_MAP: Record<
  NonNullable<BaseBottomSheetProps['height']>,
  string
> = {
  compact: 'h-auto max-h-[35vh]',
  image: 'h-auto max-h-[37vh]',
  summary: 'h-full min-h-[40vh] max-h-[80vh]',
  small: 'h-[50vh]',
  medium: 'h-[70vh]',
  full: 'h-[90vh]',
};

export default function BaseBottomSheet({
  isOpen,
  onClose,
  children,
  height = 'medium',
  showHandle = true,
  className = '',
}: BaseBottomSheetProps) {
  const {
    sheetRef,
    overlayRef,
    shouldRender,
    isAnimating,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleOverlayClick,
    overlayClassName,
    sheetStyle,
  } = useBottomSheet({
    isOpen,
    onClose,
  });

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={overlayClassName}
      aria-modal="true"
      role="dialog"
      aria-label="바텀시트"
      style={{
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      <div
        ref={sheetRef}
        className={`
          relative flex flex-col w-full bg-white rounded-t-3xl shadow-lg 
          ${HEIGHT_MAP[height]} ${className}
          ${isAnimating ? 'transition-transform duration-300 ease-out' : ''}
        `}
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {showHandle && (
          <div
            className="shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
            aria-label="바텀시트 핸들러"
          >
            <div
              className="h-1 w-12 rounded-full bg-gray-300"
              aria-hidden="true"
            />
          </div>
        )}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          aria-label="바텀시트 자식"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
