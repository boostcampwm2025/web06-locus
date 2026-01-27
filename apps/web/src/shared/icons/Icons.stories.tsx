import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorIcon } from '../ui/icons/ErrorIcon';
import { RefreshIcon } from '../ui/icons/RefreshIcon';
import { GoogleIcon } from '../ui/icons/GoogleIcon';
import { NaverIcon } from '../ui/icons/NaverIcon';
import { KakaoIcon } from '../ui/icons/KakaoIcon';
import { Logo } from '../ui/icons/Logo';
import { MapIcon } from '../ui/icons/MapIcon';
import { SearchIcon } from '../ui/icons/SearchIcon';
import { BookmarkIcon } from '../ui/icons/BookmarkIcon';
import { FavoriteIcon } from '../ui/icons/FavoriteIcon';
import { ArrowLeftIcon } from '../ui/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../ui/icons/ArrowRightIcon';
import { LocationIcon } from '../ui/icons/LocationIcon';
import { LinkIcon } from '../ui/icons/LinkIcon';
import { ImageIcon } from '../ui/icons/ImageIcon';
import { CameraIcon } from '../ui/icons/CameraIcon';
import { PlusIcon } from '../ui/icons/PlusIcon';
import { XIcon } from '../ui/icons/XIcon';
import { ZoomInIcon } from '../ui/icons/ZoomInIcon';
import { ZoomOutIcon } from '../ui/icons/ZoomOutIcon';
import { TagIcon } from '../ui/icons/TagIcon';
import { CalendarIcon } from '../ui/icons/CalendarIcon';
import { EditIcon } from '../ui/icons/EditIcon';
import { TrashIcon } from '../ui/icons/TrashIcon';
import { FilterIcon } from '../ui/icons/FilterIcon';
import { CheckIcon } from '../ui/icons/CheckIcon';
import { MoreVerticalIcon } from '../ui/icons/MoreVerticalIcon';
import { MapPinIcon } from '../ui/icons/MapPinIcon';
import { Link2Icon } from '../ui/icons/Link2Icon';
import { FileTextIcon } from '../ui/icons/FileTextIcon';
import { ChevronLeftIcon } from '../ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../ui/icons/ChevronRightIcon';
import { LogoutIcon } from '../ui/icons/LogoutIcon';
import { ShareIcon } from '../ui/icons/ShareIcon';
import { GitBranchIcon } from '../ui/icons/GitBranchIcon';
import { MaximizeIcon } from '../ui/icons/MaximizeIcon';
import { UserIcon } from '../ui/icons/UserIcon';
import { BellIcon } from '../ui/icons/BellIcon';
import { SettingsIcon } from '../ui/icons/SettingsIcon';
import { ShieldIcon } from '../ui/icons/ShieldIcon';
import { UsersIcon } from '../ui/icons/UsersIcon';
import { ClockIcon } from '../ui/icons/ClockIcon';

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
            name="LinkIcon"
            icon={<LinkIcon className="w-8 h-8 text-gray-500" />}
            description="연결 아이콘"
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
          <IconCard
            name="MapPinIcon"
            icon={<MapPinIcon className="w-8 h-8 text-red-500" />}
            description="지도 핀 아이콘"
          />
          <IconCard
            name="Link2Icon"
            icon={<Link2Icon className="w-8 h-8 text-gray-600" />}
            description="연결 아이콘 (링크)"
          />
          <IconCard
            name="FileTextIcon"
            icon={<FileTextIcon className="w-8 h-8 text-gray-600" />}
            description="파일/문서 아이콘"
          />
          <IconCard
            name="ChevronLeftIcon"
            icon={<ChevronLeftIcon className="w-8 h-8 text-gray-700" />}
            description="왼쪽 화살표 아이콘"
          />
          <IconCard
            name="ChevronRightIcon"
            icon={<ChevronRightIcon className="w-8 h-8 text-gray-700" />}
            description="오른쪽 화살표 아이콘"
          />
          <IconCard
            name="LogoutIcon"
            icon={<LogoutIcon className="w-8 h-8 text-gray-700" />}
            description="로그아웃 아이콘"
          />
          <IconCard
            name="ShareIcon"
            icon={<ShareIcon className="w-8 h-8 text-gray-600" />}
            description="공유 아이콘"
          />
          <IconCard
            name="GitBranchIcon"
            icon={<GitBranchIcon className="w-8 h-8 text-gray-600" />}
            description="브랜치/연결 그래프 아이콘"
          />
          <IconCard
            name="MaximizeIcon"
            icon={<MaximizeIcon className="w-8 h-8 text-gray-600" />}
            description="최대화 아이콘"
          />
          <IconCard
            name="UserIcon"
            icon={<UserIcon className="w-8 h-8 text-gray-600" />}
            description="사용자/프로필 아이콘"
          />
          <IconCard
            name="BellIcon"
            icon={<BellIcon className="w-8 h-8 text-gray-600" />}
            description="알림 아이콘"
          />
          <IconCard
            name="SettingsIcon"
            icon={<SettingsIcon className="w-8 h-8 text-gray-600" />}
            description="설정 아이콘"
          />
          <IconCard
            name="ShieldIcon"
            icon={<ShieldIcon className="w-8 h-8 text-gray-600" />}
            description="보안/보호 아이콘"
          />
          <IconCard
            name="UsersIcon"
            icon={<UsersIcon className="w-8 h-8 text-gray-600" />}
            description="그룹/사용자들 아이콘"
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
      <IconCard name="LinkIcon" icon={<LinkIcon className="w-8 h-8" />} />
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
      <IconCard name="MapPinIcon" icon={<MapPinIcon className="w-8 h-8" />} />
      <IconCard name="Link2Icon" icon={<Link2Icon className="w-8 h-8" />} />
      <IconCard
        name="FileTextIcon"
        icon={<FileTextIcon className="w-8 h-8" />}
      />
      <IconCard
        name="ChevronLeftIcon"
        icon={<ChevronLeftIcon className="w-8 h-8" />}
      />
      <IconCard
        name="ChevronRightIcon"
        icon={<ChevronRightIcon className="w-8 h-8" />}
      />
      <IconCard name="LogoutIcon" icon={<LogoutIcon className="w-8 h-8" />} />
      <IconCard name="ShareIcon" icon={<ShareIcon className="w-8 h-8" />} />
      <IconCard
        name="GitBranchIcon"
        icon={<GitBranchIcon className="w-8 h-8" />}
      />
      <IconCard
        name="MaximizeIcon"
        icon={<MaximizeIcon className="w-8 h-8" />}
      />
      <IconCard name="UserIcon" icon={<UserIcon className="w-8 h-8" />} />
      <IconCard name="BellIcon" icon={<BellIcon className="w-8 h-8" />} />
      <IconCard
        name="SettingsIcon"
        icon={<SettingsIcon className="w-8 h-8" />}
      />
      <IconCard name="ShieldIcon" icon={<ShieldIcon className="w-8 h-8" />} />
      <IconCard name="UsersIcon" icon={<UsersIcon className="w-8 h-8" />} />
      <IconCard name="ClockIcon" icon={<ClockIcon className="w-8 h-8" />} />
      <IconCard name="GoogleIcon" icon={<GoogleIcon className="w-8 h-8" />} />
      <IconCard name="NaverIcon" icon={<NaverIcon className="w-8 h-8" />} />
      <IconCard name="KakaoIcon" icon={<KakaoIcon className="w-8 h-8" />} />
      <IconCard name="Logo" icon={<Logo className="w-16 h-16" />} />
    </div>
  ),
};
