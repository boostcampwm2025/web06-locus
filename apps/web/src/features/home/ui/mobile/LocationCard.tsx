import { ImageWithFallback } from '@/shared/ui/image';
import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import type { LocationCardProps } from '@features/home/types/locationCard';

const DEFAULT_IMAGE = '/record-placehold.webp';

/**
 * 모바일 지도에서 처음 기록(핀) 클릭 시 보이는 플로팅 카드.
 * MainMapPage.mobile에서 사용 예정.
 */
export function LocationCard({
  image,
  title,
  subtitle,
  onViewDetail,
}: LocationCardProps) {
  return (
    <div
      className="bg-white/90 backdrop-blur-sm flex items-center gap-5 p-[20px] relative rounded-[40px] w-full max-w-[450px] shadow-xl border border-white/40 group hover:scale-[1.02] transition-transform duration-300"
      data-name="Container"
    >
      <LocationCardThumbnail image={image} title={title} />
      <LocationCardContent title={title} subtitle={subtitle} />
      <LocationCardActionButton onViewDetail={onViewDetail} />
    </div>
  );
}

function LocationCardThumbnail({
  image,
  title,
}: Pick<LocationCardProps, 'image' | 'title'>) {
  return (
    <div className="relative shrink-0 size-[56px] rounded-[16px] overflow-hidden shadow-inner">
      <ImageWithFallback
        src={image ?? DEFAULT_IMAGE}
        alt={title}
        className="size-full object-cover"
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]"
        aria-hidden
      />
    </div>
  );
}

function LocationCardContent({
  title,
  subtitle,
}: Pick<LocationCardProps, 'title' | 'subtitle'>) {
  return (
    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
      <h3 className="font-['Inter','Noto_Sans_KR',sans-serif] font-black text-[#0f172b] text-base tracking-[-0.3125px] truncate">
        {title}
      </h3>
      <div className="flex items-center gap-1.5">
        <div className="size-3 shrink-0 relative flex items-center justify-center text-[#155DFC]">
          <MapPinIcon className="size-full" />
        </div>
        <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold text-[#155dfc] text-[12px] truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function LocationCardActionButton({
  onViewDetail,
}: Pick<LocationCardProps, 'onViewDetail'>) {
  return (
    <button
      type="button"
      onClick={onViewDetail}
      className="bg-[#155dfc] h-[40px] px-4 rounded-[16px] shadow-[0px_10px_15px_0px_rgba(43,127,255,0.3),0px_4px_6px_0px_rgba(43,127,255,0.3)] shrink-0 active:scale-95 hover:bg-[#004ceb] transition-all cursor-pointer"
    >
      <span className="font-['Inter','Noto_Sans_KR',sans-serif] font-black text-[12px] text-white whitespace-nowrap">
        상세 보기
      </span>
    </button>
  );
}
