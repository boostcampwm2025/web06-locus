import type { AppHeaderTitleProps } from '@/shared/types/header';

export default function AppHeaderTitle({
  isOnline = true,
  onClick,
  className = '',
}: AppHeaderTitleProps) {
  const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-400';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${String(className)}`}
      >
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-gray-900 font-medium">Locus</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${String(className)}`}>
      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      <span className="text-gray-900 font-medium">Locus</span>
    </div>
  );
}
