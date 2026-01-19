import FormSection from './FormSection';
import { ImageIcon } from '@/shared/icons/Icons';
import type { ImageUploadButtonProps } from '@/shared/types/form';

export default function ImageUploadButton({
  label,
  onClick,
  className = '',
}: ImageUploadButtonProps) {
  return (
    <FormSection title={label} className={className}>
      <button
        type="button"
        onClick={onClick}
        className="w-full px-4 py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <ImageIcon className="w-6 h-6 text-gray-400" />
        <span className="text-gray-600 text-sm">이미지 추가</span>
      </button>
    </FormSection>
  );
}
