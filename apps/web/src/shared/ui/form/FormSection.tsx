import type { FormSectionProps } from '@/shared/types/form';

export default function FormSection({
  title,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <section className={className}>
      <h2 className="text-base font-normal text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
