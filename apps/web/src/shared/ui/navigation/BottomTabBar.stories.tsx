import type { Meta, StoryObj } from '@storybook/react-vite';
import BottomTabBar from './BottomTabBar';

const meta = {
  title: 'Shared/UI/Navigation/BottomTabBar',
  component: BottomTabBar,
  parameters: {
    layout: 'fullscreen',
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
  },
  tags: ['autodocs'],
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['home', 'record'],
      description: '현재 활성화된 탭',
    },
    onTabChange: {
      action: 'tab changed',
      description: '탭 변경 핸들러',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof BottomTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeTab: 'home',
  },
};

export const RecordActive: Story = {
  args: {
    activeTab: 'record',
  },
};

export const WithTabChange: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '탭 클릭 시 Actions 패널에서 변경 이벤트를 확인할 수 있습니다.',
      },
    },
  },
};
