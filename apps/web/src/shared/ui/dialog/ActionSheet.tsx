import { useEffect, useRef } from 'react';
import type React from 'react';
import type { ActionSheetItem, ActionSheetProps } from '@/shared/types';

/**
 * 액션 시트 컴포넌트
 * 앵커 요소 근처에 표시되는 드롭다운 메뉴
 */
export default function ActionSheet({
  isOpen,
  onClose,
  items,
  anchorElement,
  className = '',
}: ActionSheetProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorElement]);

  useEffect(() => {
    if (!isOpen || !anchorElement || !menuRef.current) return;

    const updatePosition = () => {
      if (!menuRef.current || !anchorElement) return;
      const anchorRect = anchorElement.getBoundingClientRect();
      const menuElement = menuRef.current;

      // 앵커 요소의 오른쪽 상단에 위치하도록 설정
      menuElement.style.position = 'fixed';
      menuElement.style.top = `${anchorRect.bottom + 8}px`;
      menuElement.style.right = `${window.innerWidth - anchorRect.right}px`;
    };

    // 다음 프레임에서 위치 설정 (DOM이 완전히 렌더링된 후)
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    // 리사이즈나 스크롤 시 위치 업데이트
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorElement]);

  if (!isOpen || items.length === 0) return null;

  const handleItemClick = (item: ActionSheetItem) => {
    item.onClick();
    onClose();
  };

  // anchorElement가 없으면 기본 위치 (오른쪽 상단)
  const defaultStyle: React.CSSProperties = anchorElement
    ? {}
    : { top: '60px', right: '16px' };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 드롭다운 메뉴 */}
      <div
        ref={menuRef}
        style={defaultStyle}
        className={`
          fixed z-50 bg-white rounded-lg shadow-lg
          min-w-[120px] py-1
          ${className}
        `}
        role="menu"
        aria-orientation="vertical"
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`
              w-full px-4 py-2.5 text-left text-base transition-colors
              ${
                item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                  : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              }
              ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}
            `}
            role="menuitem"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
