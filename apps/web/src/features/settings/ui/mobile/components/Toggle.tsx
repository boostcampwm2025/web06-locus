import type { ToggleProps } from '@features/settings/types';

/**
 * 모바일 설정용 토글 컴포넌트
 */
export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
        enabled ? 'bg-[#60a5fa]' : 'bg-[#e5e7eb]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-[27px] transform rounded-full bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.12)] transition duration-300 ease-in-out ${
          enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}
