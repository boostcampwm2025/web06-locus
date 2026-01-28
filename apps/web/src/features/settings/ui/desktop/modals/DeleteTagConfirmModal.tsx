import { TrashIcon } from '@/shared/ui/icons/TrashIcon';
import { ConfirmModal } from './ConfirmModal';
import type { DeleteTagConfirmModalProps } from '../../../types';

export function DeleteTagConfirmModal({
  isOpen,
  tagName,
  onConfirm,
  onCancel,
}: DeleteTagConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      icon={TrashIcon}
      title="태그를 삭제할까요?"
      description={
        <>
          <span className="text-red-500 font-bold">#{tagName}</span> 태그를
          삭제하면 모든 기록에서 해당 태그가 제거되며, 관련 연결 정보도 삭제될
          수 있습니다. <br />이 작업은 되돌릴 수 없습니다.
        </>
      }
      confirmLabel="삭제 확정"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
