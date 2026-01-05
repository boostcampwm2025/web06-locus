import { useEffect, useRef } from 'react';
import type { BaseBottomSheetProps } from './bottomSheet.types';

const HEIGHT_MAP: Record<
  NonNullable<BaseBottomSheetProps['height']>,
  string
> = {
  compact: 'h-auto max-h-[35vh]',
  small: 'h-[40vh]',
  medium: 'h-[60vh]',
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 바텀시트 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end bg-black/40 transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-label="바텀시트"
    >
      <div
        ref={sheetRef}
        className={`relative w-full bg-white rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${HEIGHT_MAP[height]} ${className}`}
        style={{
          transform: 'translateY(0)',
        }}
      >
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="h-1 w-12 rounded-full bg-gray-300"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
