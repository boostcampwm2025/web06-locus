import { LogoutIcon } from '@/shared/ui/icons/LogoutIcon';
import { ConfirmModal } from './ConfirmModal';
import type { LogoutConfirmModalProps } from '../../../types';

export function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      icon={LogoutIcon}
      title="로그아웃 하시겠습니까?"
      description={
        <>
          오늘의 기록은 여기까지인가요?
          <br />
          당신의 발자취는 이 자리에 그대로 남아있을 거예요.
          <br />
          다시 돌아와 여정을 이어가 주세요.
        </>
      }
      confirmLabel="로그아웃"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
