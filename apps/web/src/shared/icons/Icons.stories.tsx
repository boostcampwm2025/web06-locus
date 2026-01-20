import type { Meta, StoryObj } from '@storybook/react-vite';
import ErrorIcon from './ErrorIcon';
import RefreshIcon from './RefreshIcon';
import GoogleIcon from './GoogleIcon';
import NaverIcon from './NaverIcon';
import KakaoIcon from './KakaoIcon';
import Logo from './Logo';
import MapIcon from './MapIcon';
import SearchIcon from './SearchIcon';
import BookmarkIcon from './BookmarkIcon';
import FavoriteIcon from './FavoriteIcon';
import ArrowLeftIcon from './ArrowLeftIcon';
import ArrowRightIcon from './ArrowRightIcon';
import LocationIcon from './LocationIcon';
import MapPinIcon from './MapPinIcon';
import LinkIcon from './LinkIcon';
import Link2Icon from './Link2Icon';
import FileTextIcon from './FileTextIcon';
import ImageIcon from './ImageIcon';
import CameraIcon from './CameraIcon';
import PlusIcon from './PlusIcon';
import XIcon from './XIcon';
import ZoomInIcon from './ZoomInIcon';
import ZoomOutIcon from './ZoomOutIcon';
import TagIcon from './TagIcon';
import CalendarIcon from './CalendarIcon';
import EditIcon from './EditIcon';
import TrashIcon from './TrashIcon';
import FilterIcon from './FilterIcon';
import CheckIcon from './CheckIcon';
import MoreVerticalIcon from './MoreVerticalIcon';

const meta = {
  title: 'Shared/Icons',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface IconCardProps {
  name: string;
  icon: React.ReactNode;
  description?: string;
}

function IconCard({ name, icon, description }: IconCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export const IconCatalog: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          아이콘 카탈로그
        </h2>
        <p className="text-gray-600">
          프로젝트에서 사용 가능한 모든 아이콘을 확인할 수 있습니다.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          시스템 아이콘
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <IconCard
            name="ErrorIcon"
            icon={<ErrorIcon className="w-8 h-8 text-red-500" />}
            description="에러 상태 표시용 아이콘"
          />
          <IconCard
            name="RefreshIcon"
            icon={<RefreshIcon className="w-8 h-8 text-blue-500" />}
            description="새로고침/재시도 아이콘"
          />
          <IconCard
            name="MapIcon"
            icon={<MapIcon className="w-8 h-8 text-gray-700" />}
            description="지도 아이콘"
          />
          <IconCard
            name="SearchIcon"
            icon={<SearchIcon className="w-8 h-8 text-gray-600" />}
            description="검색 아이콘"
          />
          <IconCard
            name="FilterIcon"
            icon={<FilterIcon className="w-8 h-8 text-gray-600" />}
            description="필터링 아이콘"
          />
          <IconCard
            name="BookmarkIcon"
            icon={<BookmarkIcon className="w-8 h-8 text-gray-500" />}
            description="북마크 아이콘"
          />
          <IconCard
            name="FavoriteIcon"
            icon={<FavoriteIcon className="w-8 h-8 text-yellow-500" />}
            description="즐겨찾기 아이콘"
          />
          <IconCard
            name="ArrowLeftIcon"
            icon={<ArrowLeftIcon className="w-8 h-8 text-gray-700" />}
            description="뒤로가기 아이콘"
          />
          <IconCard
            name="ArrowRightIcon"
            icon={<ArrowRightIcon className="w-8 h-8 text-gray-700" />}
            description="오른쪽 화살표 아이콘"
          />
          <IconCard
            name="LocationIcon"
            icon={<LocationIcon className="w-8 h-8 text-blue-600" />}
            description="위치/장소 아이콘"
          />
          <IconCard
            name="MapPinIcon"
            icon={<MapPinIcon className="w-8 h-8 text-orange-500" />}
            description="지도 핀 아이콘"
          />
          <IconCard
            name="LinkIcon"
            icon={<LinkIcon className="w-8 h-8 text-gray-500" />}
            description="연결 아이콘"
          />
          <IconCard
            name="Link2Icon"
            icon={<Link2Icon className="w-8 h-8 text-gray-500" />}
            description="연결 아이콘 (체인 형태)"
          />
          <IconCard
            name="FileTextIcon"
            icon={<FileTextIcon className="w-8 h-8 text-gray-600" />}
            description="파일/텍스트 아이콘"
          />
          <IconCard
            name="ImageIcon"
            icon={<ImageIcon className="w-8 h-8 text-gray-600" />}
            description="이미지/사진 아이콘"
          />
          <IconCard
            name="CameraIcon"
            icon={<CameraIcon className="w-8 h-8 text-gray-600" />}
            description="카메라 아이콘"
          />
          <IconCard
            name="PlusIcon"
            icon={<PlusIcon className="w-8 h-8 text-gray-700" />}
            description="추가/더하기 아이콘"
          />
          <IconCard
            name="XIcon"
            icon={<XIcon className="w-8 h-8 text-gray-700" />}
            description="닫기/삭제 아이콘"
          />
          <IconCard
            name="ZoomInIcon"
            icon={<ZoomInIcon className="w-8 h-8 text-gray-600" />}
            description="확대 아이콘"
          />
          <IconCard
            name="ZoomOutIcon"
            icon={<ZoomOutIcon className="w-8 h-8 text-gray-600" />}
            description="축소 아이콘"
          />
          <IconCard
            name="TagIcon"
            icon={<TagIcon className="w-8 h-8 text-gray-600" />}
            description="태그 아이콘"
          />
          <IconCard
            name="CalendarIcon"
            icon={<CalendarIcon className="w-8 h-8 text-gray-600" />}
            description="캘린더 아이콘"
          />
          <IconCard
            name="EditIcon"
            icon={<EditIcon className="w-8 h-8 text-gray-700" />}
            description="수정 아이콘"
          />
          <IconCard
            name="TrashIcon"
            icon={<TrashIcon className="w-8 h-8 text-red-500" />}
            description="삭제 아이콘"
          />
          <IconCard
            name="CheckIcon"
            icon={<CheckIcon className="w-8 h-8 text-gray-700" />}
            description="체크/확인 아이콘"
          />
          <IconCard
            name="MoreVerticalIcon"
            icon={<MoreVerticalIcon className="w-8 h-8 text-gray-700" />}
            description="세로 점 3개 메뉴 아이콘"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          소셜 로그인 아이콘
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <IconCard
            name="GoogleIcon"
            icon={<GoogleIcon className="w-8 h-8" />}
            description="Google 로그인 아이콘"
          />
          <IconCard
            name="NaverIcon"
            icon={<NaverIcon className="w-8 h-8" />}
            description="Naver 로그인 아이콘"
          />
          <IconCard
            name="KakaoIcon"
            icon={<KakaoIcon className="w-8 h-8" />}
            description="Kakao 로그인 아이콘"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          브랜드 아이콘
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <IconCard
            name="Logo"
            icon={<Logo className="w-16 h-16" />}
            description="Locus 로고"
          />
        </div>
      </div>
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <IconCard name="ErrorIcon" icon={<ErrorIcon className="w-8 h-8" />} />
      <IconCard name="RefreshIcon" icon={<RefreshIcon className="w-8 h-8" />} />
      <IconCard name="MapIcon" icon={<MapIcon className="w-8 h-8" />} />
      <IconCard name="SearchIcon" icon={<SearchIcon className="w-8 h-8" />} />
      <IconCard name="FilterIcon" icon={<FilterIcon className="w-8 h-8" />} />
      <IconCard
        name="BookmarkIcon"
        icon={<BookmarkIcon className="w-8 h-8" />}
      />
      <IconCard
        name="FavoriteIcon"
        icon={<FavoriteIcon className="w-8 h-8" />}
      />
      <IconCard
        name="ArrowLeftIcon"
        icon={<ArrowLeftIcon className="w-8 h-8" />}
      />
      <IconCard
        name="ArrowRightIcon"
        icon={<ArrowRightIcon className="w-8 h-8" />}
      />
      <IconCard
        name="LocationIcon"
        icon={<LocationIcon className="w-8 h-8" />}
      />
      <IconCard name="MapPinIcon" icon={<MapPinIcon className="w-8 h-8" />} />
      <IconCard name="LinkIcon" icon={<LinkIcon className="w-8 h-8" />} />
      <IconCard name="Link2Icon" icon={<Link2Icon className="w-8 h-8" />} />
      <IconCard
        name="FileTextIcon"
        icon={<FileTextIcon className="w-8 h-8" />}
      />
      <IconCard name="ImageIcon" icon={<ImageIcon className="w-8 h-8" />} />
      <IconCard name="CameraIcon" icon={<CameraIcon className="w-8 h-8" />} />
      <IconCard name="PlusIcon" icon={<PlusIcon className="w-8 h-8" />} />
      <IconCard name="XIcon" icon={<XIcon className="w-8 h-8" />} />
      <IconCard name="ZoomInIcon" icon={<ZoomInIcon className="w-8 h-8" />} />
      <IconCard name="ZoomOutIcon" icon={<ZoomOutIcon className="w-8 h-8" />} />
      <IconCard name="TagIcon" icon={<TagIcon className="w-8 h-8" />} />
      <IconCard
        name="CalendarIcon"
        icon={<CalendarIcon className="w-8 h-8" />}
      />
      <IconCard name="EditIcon" icon={<EditIcon className="w-8 h-8" />} />
      <IconCard name="TrashIcon" icon={<TrashIcon className="w-8 h-8" />} />
      <IconCard name="CheckIcon" icon={<CheckIcon className="w-8 h-8" />} />
      <IconCard
        name="MoreVerticalIcon"
        icon={<MoreVerticalIcon className="w-8 h-8" />}
      />
      <IconCard name="GoogleIcon" icon={<GoogleIcon className="w-8 h-8" />} />
      <IconCard name="NaverIcon" icon={<NaverIcon className="w-8 h-8" />} />
      <IconCard name="KakaoIcon" icon={<KakaoIcon className="w-8 h-8" />} />
      <IconCard name="Logo" icon={<Logo className="w-16 h-16" />} />
    </div>
  ),
};
