import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { LocationCard } from './LocationCard';

const meta = {
  title: 'Features/Home/Mobile/LocationCard',
  component: LocationCard,
  parameters: {
    layout: 'centered',
    viewport: {
      viewports: {
        mobile1: {
          name: 'iPhone SE',
          styles: { width: '375px', height: '667px' },
        },
        mobile2: {
          name: 'iPhone 12/13',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    image: { control: 'text', description: '썸네일 이미지 URL' },
    title: { control: 'text', description: '장소 제목' },
    subtitle: { control: 'text', description: '장소 부제(위치 등)' },
    onViewDetail: { action: 'viewDetail', description: '상세 보기 클릭' },
  },
} satisfies Meta<typeof LocationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '북한산 우이동 입구',
    subtitle: '서울 강북구 우이동',
    onViewDetail: fn(),
  },
};

export const WithImage: Story = {
  args: {
    image:
      'https://images.unsplash.com/photo-1698880653142-54c5a35bebba?q=80&w=400',
    title: '북한산 우이동 입구',
    subtitle: '서울 강북구 우이동',
    onViewDetail: fn(),
  },
};

export const LongTitle: Story = {
  args: {
    title: '북한산국립공원 우이동 탐방지원센터 주변 산책로',
    subtitle: '서울 강북구 우이동 123-45',
    onViewDetail: fn(),
  },
};
