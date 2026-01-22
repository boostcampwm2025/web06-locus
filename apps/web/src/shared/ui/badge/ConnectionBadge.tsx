/**
 * 연결 배지 컴포넌트
 * 이미 연결된 기록을 표시할 때 사용
 */
export default function ConnectionBadge({
  className = '',
}: {
  className?: string;
}) {
  return (
    <span
      className={`px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full shrink-0 ${className}`}
    >
      연결
    </span>
  );
}
