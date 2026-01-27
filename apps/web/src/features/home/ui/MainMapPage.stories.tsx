import type { Meta, StoryObj } from '@storybook/react-vite';
import MainMapPage from './MainMapPage';
import { MainMapPageMobile } from './mobile/MainMapPage.mobile';
import { MainMapPageDesktop } from './desktop/MainMapPage.desktop';

const meta: Meta<typeof MainMapPage> = {
  title: 'Features/Home/MainMapPage',
  component: MainMapPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MainMapPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 자동 분기 버전
 * useDeviceType 훅에 따라 모바일/데스크톱이 자동으로 선택됩니다.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기기 타입에 따라 자동으로 모바일/데스크톱 버전이 선택됩니다.',
      },
    },
  },
};

/**
 * 모바일 버전
 */
export const Mobile: Story = {
  render: () => <MainMapPageMobile />,
  parameters: {
    viewport: {
      viewports: {
        mobile1: {
          name: 'iPhone SE',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        mobile2: {
          name: 'iPhone 12/13',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
        mobile3: {
          name: 'iPhone 14 Pro Max',
          styles: {
            width: '430px',
            height: '932px',
          },
        },
        mobile4: {
          name: 'Samsung Galaxy S20',
          styles: {
            width: '360px',
            height: '800px',
          },
        },
      },
      defaultViewport: 'mobile2',
    },
    docs: {
      description: {
        story:
          '모바일 버전 UI입니다. AppHeader, CategoryChips, MapViewport, BottomTabBar가 포함되어 있습니다.',
      },
    },
  },
};

/**
 * 데스크톱 버전
 */
export const Desktop: Story = {
  render: () => <MainMapPageDesktop />,
  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        laptop: {
          name: 'Laptop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story:
          '데스크톱 버전 UI입니다. 좌측 사이드바와 메인 지도 영역으로 구성되어 있습니다.',
      },
    },
  },
};
