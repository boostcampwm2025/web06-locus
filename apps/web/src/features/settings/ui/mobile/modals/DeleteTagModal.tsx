import { ModalBase } from '../components/ModalBase';
import { WarningCircleIcon } from '@/shared/ui/icons/WarningCircleIcon';
import type { DeleteTagConfirmModalProps } from '@features/settings/types';

/**
 * 모바일 태그 삭제 확인 모달
 */
export function DeleteTagModal({
  isOpen,
  onCancel,
  onConfirm,
  tagName,
}: DeleteTagConfirmModalProps) {
  return (
    <ModalBase isOpen={isOpen} onClose={onCancel}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#fef2f2]">
          <WarningCircleIcon className="size-8 text-[#FB2C36]" />
        </div>
        <h3 className="mb-2 font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] font-bold text-[#1e2939]">
          태그를 삭제하시겠습니까?
        </h3>
        <p className="mb-8 font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] leading-relaxed text-[#99a1af]">
          '{tagName}' 태그를 삭제하면 이 태그가 달린 모든 기록에서 해당 정보가
          영구적으로 사라집니다.
        </p>
        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            className="h-[56px] flex-1 rounded-[16px] bg-[#f3f4f6] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-[#4a5565]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="h-[56px] flex-1 rounded-[16px] bg-[#fb2c36] font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[16px] font-medium text-white shadow-lg active:scale-[0.98]"
          >
            삭제하기
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
