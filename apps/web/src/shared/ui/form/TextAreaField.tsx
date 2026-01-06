import FormSection from './FormSection';
import type { TextAreaFieldProps } from '@/shared/types/form';

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  minHeight = '120px',
  required = false,
  className = '', // FormSection에만 적용
}: TextAreaFieldProps) {
  return (
    <FormSection title={label} className={className}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder:text-gray-400"
        style={{ minHeight }}
      />
    </FormSection>
  );
}
