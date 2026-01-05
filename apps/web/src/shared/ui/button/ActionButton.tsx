import type { ActionButtonProps } from './actionButton.types';

export default function ActionButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  const baseClasses =
    'w-full rounded-xl px-6 py-3.5 text-base font-normal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-gray-900 text-white hover:bg-gray-800'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200';

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
