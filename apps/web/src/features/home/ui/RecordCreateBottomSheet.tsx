import { BaseBottomSheet } from '@/shared/ui/bottomSheet';
import { ActionButton } from '@/shared/ui/button';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import type { RecordCreateBottomSheetProps } from '../types/recordCreateBottomSheet';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

export default function RecordCreateBottomSheet({
  isOpen,
  onClose,
  locationName,
  address,
  coordinates,
  onConfirm,
}: RecordCreateBottomSheetProps) {
  // 같은 좌표에 대한 요청은 자동으로 캐시되어 불필요한 API 호출 방지

  const { data: reverseGeocodeData, isLoading } = useReverseGeocode({
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
    enabled: isOpen && coordinates !== undefined,
  });

  // 표시할 name과 address 결정 (역지오코딩 결과 우선, 없으면 기본값)
  const displayName =
    reverseGeocodeData?.data?.name ?? locationName ?? '선택한 위치';
  const displayAddress =
    reverseGeocodeData?.data?.address ?? address ?? '주소 정보 없음';

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

        {/* 위치 이름 (크게) */}
        <h3 className="mb-1 text-center text-2xl font-semibold text-gray-900">
          {isLoading ? '위치 정보 불러오는 중...' : displayName}
        </h3>

        {/* 주소 (작게) */}
        <p className="mb-6 text-center text-sm text-gray-500">
          {displayAddress}
        </p>

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
