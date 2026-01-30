import type { GeocodeAddress } from '@/infra/types/map';

interface SearchResultsPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  results?: GeocodeAddress[];
  onSelect: (address: GeocodeAddress) => void;
  onClose?: () => void;
}

const formatSearchTitle = (title: string) =>
  title
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

export default function SearchResultsPanel({
  isOpen,
  isLoading,
  query,
  results,
  onSelect,
  onClose,
}: SearchResultsPanelProps) {
  if (!isOpen || query.trim().length === 0) return null;

  return (
    <div className="fixed inset-0 z-40" role="presentation">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="absolute top-[72px] left-0 right-0 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">검색 중...</div>
          ) : (results?.length ?? 0) > 0 ? (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {results!.map((addr, index) => (
                <li key={`${addr.latitude}-${addr.longitude}-${index}`}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
                    onClick={() => onSelect(addr)}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {formatSearchTitle(addr.title) ||
                        addr.roadAddress ||
                        addr.jibunAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {addr.roadAddress || addr.jibunAddress || '주소 없음'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
