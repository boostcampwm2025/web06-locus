import { useState, useRef } from 'react';
import { ArrowLeftIcon } from '@/shared/ui/icons/ArrowLeftIcon';
import { FavoriteIcon } from '@/shared/ui/icons/FavoriteIcon';
import { MoreVerticalIcon } from '@/shared/ui/icons/MoreVerticalIcon';
import { CalendarIcon } from '@/shared/ui/icons/CalendarIcon';
import { LocationIcon } from '@/shared/ui/icons/LocationIcon';
import { ActionSheet, ConfirmDialog } from '@/shared/ui/dialog';
import type { RecordDetailPageProps } from '@/features/record/types';
import { formatDateShort } from '@/shared/utils/dateUtils';
import { getDisplayTags } from '@/shared/utils/tagUtils';

export default function RecordDetailPage({
  title,
  date,
  location,
  tags,
  description,
  imageUrl,
  connectionCount,
  isFavorite = false,
  onBack,
  onFavoriteToggle,
  onMenuClick,
  onConnectionManage,
  onConnectionMode,
  onEdit,
  onDelete,
  className = '',
}: RecordDetailPageProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setIsActionSheetOpen(true);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-white ${className}`}>
      {/* 1. 고정 헤더 */}
      <RecordDetailHeader
        title={title}
        isFavorite={isFavorite}
        onBack={onBack}
        onFavoriteToggle={onFavoriteToggle}
        onMenuClick={handleMenuClick}
        menuButtonRef={menuButtonRef}
      />

      {/* 2. 스크롤 가능한 본문 영역 */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <RecordMetaInfo
          title={title}
          date={date}
          location={location}
          tags={tags}
        />

        <RecordContent
          imageUrl={imageUrl}
          description={description}
          title={title}
        />
      </main>

      {/* 3. 하단 고정 액션 버튼 */}
      <RecordActionButtons
        connectionCount={connectionCount}
        onConnectionManage={onConnectionManage}
        onConnectionMode={onConnectionMode}
      />

      {/* 메뉴 액션 시트 */}
      {isActionSheetOpen && (
        <div className="relative">
          <ActionSheet
            isOpen={isActionSheetOpen}
            onClose={() => setIsActionSheetOpen(false)}
            anchorElement={menuButtonRef.current}
            items={[
              ...(onEdit ? [{ label: '편집하기', onClick: onEdit }] : []),
              ...(onDelete
                ? [
                    {
                      label: '삭제하기',
                      onClick: () => {
                        setIsActionSheetOpen(false);
                        setIsDeleteConfirmOpen(true);
                      },
                      variant: 'danger' as const,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}

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

/**
 * 헤더 컴포넌트
 */
function RecordDetailHeader({
  title,
  isFavorite,
  onBack,
  onFavoriteToggle,
  onMenuClick,
  menuButtonRef,
}: {
  title: string;
  isFavorite: boolean;
  onBack?: () => void;
  onFavoriteToggle?: () => void;
  onMenuClick?: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 truncate px-2">
        {title}
      </h1>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FavoriteIcon
            className={`w-6 h-6 ${
              isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'
            }`}
          />
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          aria-label="메뉴"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVerticalIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}

/**
 * 메타 정보 컴포넌트
 */
function RecordMetaInfo({
  title,
  date,
  location,
  tags,
}: {
  title: string;
  date: Date;
  location: { name: string; address: string };
  tags: string[];
}) {
  const { displayTags, remainingCount } = getDisplayTags(tags, 4);

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDateShort(date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <LocationIcon className="w-4 h-4" />
          <span>{location.name}</span>
        </div>
      </div>
      {displayTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-full">
              +{remainingCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 콘텐츠 영역 컴포넌트
 */
function RecordContent({
  imageUrl,
  description,
  title,
}: {
  imageUrl?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="pb-10">
      {imageUrl && (
        <div className="w-full mb-6">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}
      <div className="px-4">
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * 하단 고정 버튼 컴포넌트
 */
function RecordActionButtons({
  connectionCount,
  onConnectionManage,
  onConnectionMode,
}: {
  connectionCount: number;
  onConnectionManage?: () => void;
  onConnectionMode?: () => void;
}) {
  return (
    <div className="px-4 pt-4 pb-8 border-t border-gray-100 bg-white shrink-0 space-y-3">
      <button
        type="button"
        onClick={onConnectionManage}
        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium active:bg-gray-800 transition-colors"
      >
        연결 관리 ({connectionCount})
      </button>
      <button
        type="button"
        onClick={onConnectionMode}
        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg font-medium active:bg-gray-50 transition-colors"
      >
        연결 모드
      </button>
    </div>
  );
}
