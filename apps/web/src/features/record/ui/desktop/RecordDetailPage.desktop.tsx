import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import { FavoriteIcon } from '@/shared/ui/icons/FavoriteIcon';
import { XIcon } from '@/shared/ui/icons/XIcon';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { GitBranchIcon } from '@/shared/ui/icons/GitBranchIcon';
import { LinkIcon } from '@/shared/ui/icons/LinkIcon';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { ROUTES } from '@/router/routes';
import type { RecordDetailPageProps } from '@/features/record/types';
import type {
  ConnectionGraphCTAProps,
  ConnectedRecordsSectionProps,
} from '@/shared/types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import ConnectionNetworkView from '@/features/connection/ui/ConnectionNetworkView';
import { RecordImageSlider } from '@/shared/ui/record';

export function RecordDetailPageDesktop({
  title,
  date,
  location,
  tags,
  description,
  imageUrl,
  imageUrls,
  connectionCount,
  connectedRecords = [],
  graphNodes,
  graphEdges,
  baseRecordPublicId,
  isFavorite = false,
  onBack,
  onFavoriteToggle,
  onConnectionManage,
  onConnectionMode,
  onDelete,
  onRecordClick,
  className = '',
}: RecordDetailPageProps) {
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      void navigate(-1);
    }
  };

  /** 연결보기: 그래프 데이터가 있으면 사이드패널 열기, 없으면 연결 모드 페이지로 이동 */
  const handleOpenGraph = () => {
    if (
      graphNodes &&
      graphNodes.length > 0 &&
      graphEdges &&
      baseRecordPublicId
    ) {
      setIsGraphPanelOpen(true);
    } else {
      onConnectionMode?.();
    }
  };

  const handleGraphNodeClick = (publicId: string) => {
    onRecordClick?.(publicId);
    setIsGraphPanelOpen(false);
  };

  /** 연결 그래프 뷰: 좌측 기록 요약 패널 + 우측 전체 그래프 */
  const showGraphView =
    isGraphPanelOpen &&
    graphNodes &&
    graphNodes.length > 0 &&
    graphEdges &&
    baseRecordPublicId;

  if (showGraphView) {
    return (
      <div
        className={`fixed inset-0 bg-white z-100 flex overflow-hidden ${className}`}
      >
        {/* 좌측: 기록 요약 사이드패널 */}
        <aside
          className="w-full max-w-[400px] shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-y-auto"
          aria-label="기록 요약"
        >
          <div className="p-4 pb-6 flex flex-col flex-1">
            <button
              type="button"
              onClick={() => setIsGraphPanelOpen(false)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium mb-4 w-fit"
            >
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
              기록 상세로 돌아가기
            </button>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-orange-50 text-[#FE8916] text-xs font-black uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 제목 */}
            <h1 className="text-xl font-black text-gray-900 mb-4 leading-tight">
              {title}
            </h1>

            {/* 위치 & 날짜 */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <LocationIcon className="w-4 h-4 text-[#73C92E]" />
                <span>
                  {location.name?.trim() ||
                    location.address?.trim() ||
                    '장소 없음'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDateShort(date)}</span>
              </div>
            </div>

            {/* 이미지 (여러 장이면 슬라이더) */}
            {(imageUrls?.length ?? 0) > 0 ? (
              <div className="w-full aspect-video mb-6 rounded-2xl overflow-hidden">
                <RecordImageSlider
                  urls={imageUrls!}
                  alt={title}
                  className="rounded-2xl"
                />
              </div>
            ) : imageUrl ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* 기록 요약 */}
            <div className="mb-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                기록 요약
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">
                {description || '요약 내용이 없습니다.'}
              </p>
            </div>

            {/* 기록 상세 페이지로 이동 */}
            <button
              type="button"
              onClick={() => setIsGraphPanelOpen(false)}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              기록 상세 페이지로 이동
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* 우측: 연결 네트워크 뷰 (요약 패널 옆 전체 스크린 채움) */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col h-full bg-gray-50">
          <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
            <h2 className="text-lg font-black text-gray-900 mb-1">
              연결 네트워크 뷰
            </h2>
            <p className="text-sm text-gray-500">노드의 관계를 탐색하세요.</p>
          </div>
          <div className="flex-1 min-h-0 p-4 flex flex-col">
            <ConnectionNetworkView
              nodes={graphNodes}
              edges={graphEdges}
              baseRecordPublicId={baseRecordPublicId}
              onNodeClick={handleGraphNodeClick}
              className="flex-1 min-h-0 w-full rounded-2xl"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-white z-100 overflow-y-auto ${className}`}
    >
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold"
          >
            <ChevronRightIcon className="w-5 h-5 rotate-180" />
            목록으로
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onFavoriteToggle}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <FavoriteIcon
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-600'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="닫기"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 본문 */}
      <article className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-12">
          {/* 태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-orange-50 text-[#FE8916] text-xs font-black uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 제목 */}
          <h1 className="text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            {title}
          </h1>

          {/* 연결 그래프 CTA */}
          {connectionCount > 0 && (
            <ConnectionGraphCTA
              connectionCount={connectionCount}
              onOpenGraph={handleOpenGraph}
            />
          )}

          {/* 위치 및 날짜 */}
          <div className="flex items-center gap-6 text-gray-500 mt-8">
            <div className="flex items-center gap-2">
              <LocationIcon className="w-5 h-5 text-[#73C92E]" />
              <span className="font-bold text-gray-900">
                {location.name?.trim() ||
                  location.address?.trim() ||
                  '장소 없음'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{formatDateShort(date)}</span>
            </div>
          </div>
        </header>

        {/* 메인 이미지 (여러 장이면 슬라이더) */}
        {(imageUrls?.length ?? 0) > 0 ? (
          <div className="w-full aspect-21/9 mb-12 rounded-[40px] overflow-hidden shadow-2xl">
            <RecordImageSlider
              urls={imageUrls!}
              alt={title}
              className="rounded-[40px]"
            />
          </div>
        ) : imageUrl ? (
          <div className="w-full aspect-21/9 rounded-[40px] overflow-hidden shadow-2xl mb-12">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* 본문 및 사이드바 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* 본문 */}
          <div className="md:col-span-2">
            <SectionTitle>기록 본문</SectionTitle>
            <div className="prose prose-lg max-w-none text-gray-700 leading-[1.8] font-medium whitespace-pre-line">
              {description}
            </div>
          </div>

          {/* 사이드바 */}
          <aside className="space-y-12">
            {connectionCount > 0 && (
              <ConnectedRecordsSection
                connectedRecords={connectedRecords}
                onConnectionManage={onConnectionManage}
                onRecordClick={onRecordClick}
              />
            )}
          </aside>
        </div>
      </article>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="이 기록을 삭제할까요?"
        message="삭제한 기록은 다시 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => {
          onDelete?.();
          setIsDeleteConfirmOpen(false);
        }}
        variant="danger"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
      {children}
    </h3>
  );
}

function ConnectionGraphCTA({
  connectionCount,
  onOpenGraph,
}: ConnectionGraphCTAProps) {
  return (
    <div className="mb-12">
      <SectionTitle>Network Insight</SectionTitle>
      <button
        type="button"
        onClick={onOpenGraph}
        className="group relative bg-white border border-gray-100 rounded-[40px] p-2 pr-8 flex items-center gap-6 cursor-pointer shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-10px_rgba(254,137,22,0.12)] hover:border-orange-100 transition-all duration-500 w-full text-left"
      >
        {/* Visual Preview Area */}
        <div className="w-48 h-32 bg-gray-50 rounded-[32px] overflow-hidden relative shrink-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#FE8916 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#FE8916] z-10 relative">
                <GitBranchIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-orange-50 text-[#FE8916] text-[10px] font-black rounded-md uppercase tracking-widest">
              Connected
            </span>
            <span className="text-sm font-bold text-gray-400">
              {connectionCount}개의 연결된 기록
            </span>
          </div>
          <h4 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-[#FE8916] transition-colors tracking-tight">
            지식 연결 그래프 탐색
          </h4>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            기록들 사이의 숨겨진 관계와 구조를 시각화하여 확인하세요.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FE8916] group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
          <ChevronRightIcon className="w-7 h-7" />
        </div>
      </button>
    </div>
  );
}

// 연결된 기록 섹션 컴포넌트
function ConnectedRecordsSection({
  connectedRecords,
  onConnectionManage,
  onRecordClick,
}: ConnectedRecordsSectionProps) {
  const navigate = useNavigate();

  const handleRecordClick = (recordId: string) => {
    onRecordClick?.(recordId);
    void navigate(ROUTES.RECORD_DETAIL.replace(':id', recordId));
  };

  return (
    <div>
      <SectionTitle>연결된 기록들</SectionTitle>
      <div className="space-y-4">
        {connectedRecords.length > 0 ? (
          <>
            {connectedRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => handleRecordClick(record.id)}
                className="w-full text-left group"
              >
                <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md">
                  {/* 이미지 */}
                  <div className="w-full aspect-4/3 bg-gray-100 overflow-hidden">
                    {record.imageUrl ? (
                      <img
                        src={record.imageUrl}
                        alt={record.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  {/* 콘텐츠 */}
                  <div className="p-4">
                    <h4 className="text-base font-black text-gray-900 mb-1 line-clamp-2 group-hover:text-[#FE8916] transition-colors">
                      {record.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {record.location.name?.trim() ||
                        record.location.address?.trim() ||
                        '장소 없음'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {onConnectionManage && (
              <button
                type="button"
                onClick={onConnectionManage}
                className="w-full py-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                연결 관리하기
              </button>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">연결된 기록이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
