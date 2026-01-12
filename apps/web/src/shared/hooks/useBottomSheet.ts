import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  UseBottomSheetOptions,
  UseBottomSheetReturn,
} from '@/shared/types';

export function useBottomSheet(
  options: UseBottomSheetOptions,
): UseBottomSheetReturn {
  const {
    isOpen,
    onClose,
    snapThreshold = 30,
    animationDuration = 300,
  } = options;

  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartTranslateY, setDragStartTranslateY] = useState(0);

  const [currentTranslateY, setCurrentTranslateY] = useState(100); // 닫힌 상태
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(true);

      // mount 직후 상태(translateY=100%)를 한 프레임 렌더한 뒤
      // 다음 프레임에서 위치를 변경해 transition이 확실히 트리거되도록
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrentTranslateY(0);
        });
      });

      return;
    }

    setIsAnimating(true);
    setCurrentTranslateY(100);

    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      setIsAnimating(false);
      closeTimerRef.current = null;
    }, animationDuration);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, animationDuration]);

  const handleDragStart = useCallback(
    (clientY: number) => {
      if (!isOpen) return;

      setIsDragging(true);
      setDragStartY(clientY);
      setDragStartTranslateY(currentTranslateY);
      setIsAnimating(false); // drag 중 transition 제거
    },
    [isOpen, currentTranslateY],
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging || !isOpen || !sheetRef.current) return;

      const deltaY = clientY - dragStartY;
      const sheetHeight = sheetRef.current.offsetHeight;

      const translateY = Math.max(
        0,
        Math.min(100, (deltaY / sheetHeight) * 100 + dragStartTranslateY),
      );

      setCurrentTranslateY(translateY);
    },
    [isDragging, isOpen, dragStartY, dragStartTranslateY],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsAnimating(true);

    const currentPercent = currentTranslateY;

    if (currentPercent > snapThreshold) {
      setCurrentTranslateY(100);

      closeTimerRef.current = window.setTimeout(() => {
        onClose();
        closeTimerRef.current = null;
      }, animationDuration);
    } else {
      setCurrentTranslateY(0);
    }
  }, [
    isDragging,
    currentTranslateY,
    snapThreshold,
    onClose,
    animationDuration,
  ]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      handleDragStart(e.touches[0].clientY);
    },
    [handleDragStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    },
    [handleDragMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleDragStart(e.clientY);
    },
    [handleDragStart],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientY);
    },
    [handleDragMove],
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current && !isDragging) {
        onClose();
      }
    },
    [isDragging, onClose],
  );

  const overlayClassName = `fixed inset-0 z-50 flex items-end bg-black/40 transition-opacity duration-300 ${
    isOpen && currentTranslateY < 100 ? 'opacity-100' : 'opacity-0'
  }`;

  const sheetStyle: React.CSSProperties = {
    transform: `translateY(${currentTranslateY}%)`,
    touchAction: 'none',
  };

  return {
    sheetRef,
    overlayRef,
    shouldRender,
    currentTranslateY,
    isAnimating,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleOverlayClick,
    overlayClassName,
    sheetStyle,
  };
}
