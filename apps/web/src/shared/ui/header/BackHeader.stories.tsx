import type { Meta, StoryObj } from '@storybook/react-vite';
import BackHeader from './BackHeader';

const meta = {
  title: 'Shared/UI/Header/BackHeader',
  component: BackHeader,
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
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '헤더 제목',
    },
    onBack: {
      action: 'back clicked',
      description: '뒤로 가기 버튼 클릭 핸들러',
    },
  },
} satisfies Meta<typeof BackHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '연결 관리',
    onBack: () => {
      /* empty */
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    title: '매우 긴 제목이 들어가는 경우의 헤더',
    onBack: () => {
      /* empty */
    },
  },
};
