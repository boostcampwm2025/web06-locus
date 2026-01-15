import type { ConnectActionButtonProps } from '../types/recordConnection';

/**
 * 연결하기 액션 버튼 컴포넌트
 */
export default function ConnectActionButton({
  isEnabled,
  onClick,
  disabledText = '도착 기록을 선택하세요',
  enabledText = '연결하기',
  className = '',
}: ConnectActionButtonProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-[calc(1rem+env(safe-area-inset-bottom))] ${className}`}
    >
      <button
        type="button"
        disabled={!isEnabled}
        aria-disabled={!isEnabled}
        onClick={() => {
          if (!isEnabled) return;
          onClick();
        }}
        className={`w-full py-4 rounded-lg font-medium text-base transition-colors ${
          isEnabled
            ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isEnabled ? enabledText : disabledText}
      </button>
    </div>
  );
}
