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
            name="BookmarkIcon"
            icon={<BookmarkIcon className="w-8 h-8 text-gray-500" />}
            description="북마크 아이콘"
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
      <IconCard
        name="BookmarkIcon"
        icon={<BookmarkIcon className="w-8 h-8" />}
      />
      <IconCard name="GoogleIcon" icon={<GoogleIcon className="w-8 h-8" />} />
      <IconCard name="NaverIcon" icon={<NaverIcon className="w-8 h-8" />} />
      <IconCard name="KakaoIcon" icon={<KakaoIcon className="w-8 h-8" />} />
      <IconCard name="Logo" icon={<Logo className="w-16 h-16" />} />
    </div>
  ),
};
