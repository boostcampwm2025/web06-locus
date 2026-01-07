import type { AppHeaderTitleProps } from '@/shared/types/header';

export default function AppHeaderTitle({
  isOnline = true,
  className = '',
}: AppHeaderTitleProps) {
  const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className={`flex items-center gap-2 ${String(className)}`}>
      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      <span className="text-gray-900 font-medium">Locus</span>
    </div>
  );
}
