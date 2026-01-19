import { BaseBottomSheet } from '@/shared/ui/bottomSheet';
import { ActionButton } from '@/shared/ui/button';
import { LocationIcon } from '@/shared/icons/Icons';
import type { RecordCreateBottomSheetProps } from '../types/recordCreateBottomSheet';

export default function RecordCreateBottomSheet({
  isOpen,
  onClose,
  locationName,
  address,
  onConfirm,
}: RecordCreateBottomSheetProps) {
  return (
    <BaseBottomSheet isOpen={isOpen} onClose={onClose} height="small">
      <div className="flex flex-col items-center px-6 pb-6 pt-4">
        {/* 위치 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <LocationIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* 위치 확인 질문 */}
        <h2 className="mb-3 text-center text-base font-normal text-gray-900">
          이 위치가 맞나요?
        </h2>

        {/* 위치 이름 */}
        <h3 className="mb-1 text-center text-xl font-normal text-gray-900">
          {locationName}
        </h3>

        {/* 주소 */}
        <p className="mb-6 text-center text-sm text-gray-500">{address}</p>

        {/* 액션 버튼들 */}
        <div className="flex w-full flex-col gap-2.5">
          <ActionButton variant="primary" onClick={onConfirm}>
            기록 작성하기
          </ActionButton>
          <ActionButton variant="secondary" onClick={onClose}>
            취소
          </ActionButton>
        </div>

        {/* 안내 문구 */}
        <p className="mt-4 text-center text-xs text-gray-400">
          핀을 드래그하여 위치를 미세 조정할 수 있습니다
        </p>
      </div>
    </BaseBottomSheet>
  );
}
