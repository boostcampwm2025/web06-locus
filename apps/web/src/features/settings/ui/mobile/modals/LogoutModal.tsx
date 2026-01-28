import { ModalBase } from '../components/ModalBase';
import { LogoutIcon } from '@/shared/ui/icons/LogoutIcon';
import type { LogoutConfirmModalProps } from '@features/settings/types';

/**
 * 모바일 로그아웃 확인 모달
 */
export function LogoutModal({
  isOpen,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  return (
    <ModalBase isOpen={isOpen} onClose={onCancel}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#fef2f2]">
          <LogoutIcon className="size-8 text-[#FB2C36]" />
        </div>
        <h3 className="mb-2 font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-bold text-[#1e2939]">
          로그아웃 하시겠습니까?
        </h3>
        <p className="mb-8 font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] leading-relaxed text-[#99a1af]">
          다시 로그인할 때까지 서비스 이용이 제한될 수 있습니다.
        </p>
        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            className="h-[56px] flex-1 rounded-[16px] bg-[#f3f4f6] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-[#4a5565] transition-colors hover:bg-[#e5e7eb]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="h-[56px] flex-1 rounded-[16px] bg-[#fb2c36] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            로그아웃
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
