import { motion } from 'motion/react';
import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import { CheckIcon } from '@/shared/ui/icons/CheckIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { NavigationIcon } from '@/shared/ui/icons/NavigationIcon';

// --- Types ---
export interface LocationConfirmationLocation {
  name: string;
  address: string;
}

export interface LocationConfirmationProps {
  location: LocationConfirmationLocation;
  onConfirm: () => void;
  onCancel: () => void;
}

const DEFAULT_NAME = '선택한 위치';
const DEFAULT_ADDRESS = '주소 정보 없음';

/** 모달 위치: 상단에서 떨어진 거리. 조절해서 위치 변경 */
const MODAL_TOP = '40%';

function getDisplayPrimary(location: LocationConfirmationLocation): string {
  return location.address || location.name || DEFAULT_NAME;
}

function getDisplaySecondary(
  location: LocationConfirmationLocation,
): string | null {
  if (location.address && location.name) return location.name;
  if (location.name && !location.address) return null;
  return location.address ? null : DEFAULT_ADDRESS;
}

export function LocationConfirmation({
  location,
  onConfirm,
  onCancel,
}: LocationConfirmationProps) {
  const primaryText = getDisplayPrimary(location);
  const secondaryText = getDisplaySecondary(location);

  return (
    <>
      {/* 모달 밖 클릭 시 닫기 */}
      <div
        className="absolute inset-0 z-100"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        role="presentation"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute z-101 w-full max-w-md px-4"
        style={{
          top: MODAL_TOP,
          left: '30%',
          transform: 'translateX(-50%)',
        }}
        role="dialog"
        aria-labelledby="location-confirmation-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
          <div className="p-6">
            <LocationHeader primary={primaryText} secondary={secondaryText} />
          </div>

          <ActionButtons onConfirm={onConfirm} onCancel={onCancel} />
        </div>
      </motion.div>
    </>
  );
}

const LocationHeader = ({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string | null;
}) => (
  <div className="flex items-start gap-5">
    {/* 시각적 아이콘 영역 */}
    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
      <div className="relative">
        <MapPinIcon className="size-7 text-[#FE8916]" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#73C92E] rounded-full border-2 border-white"
        />
      </div>
    </div>

    {/* 텍스트 정보 영역 */}
    <div className="flex-1 min-w-0 pt-1">
      <h3
        id="location-confirmation-title"
        className="text-lg font-black text-gray-900 leading-tight truncate"
      >
        이 위치에 기록을 남길까요?
      </h3>
      <div className="mt-2 flex items-center gap-1.5 text-gray-400">
        <NavigationIcon className="size-3 shrink-0" />
        <p className="text-[13px] font-medium truncate">{primary}</p>
      </div>
      {secondary && (
        <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed italic truncate">
          {secondary}
        </p>
      )}
    </div>
  </div>
);

const ActionButtons = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="flex border-t border-gray-50">
    <button
      type="button"
      onClick={onCancel}
      className="flex-1 py-5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border-r border-gray-50 group"
    >
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
        <XIcon className="size-[18px]" />
      </div>
      <span className="text-sm font-black text-gray-500">취소</span>
    </button>

    <button
      type="button"
      onClick={onConfirm}
      className="flex-1 py-5 flex items-center justify-center gap-2 bg-linear-to-r from-[#FE8916] to-[#FF9D3D] hover:from-[#e67a12] hover:to-[#fe8916] transition-all group"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
        <CheckIcon className="size-[18px]" />
      </div>
      <span className="text-sm font-black text-white">이 위치에 기록하기</span>
    </button>
  </div>
);
