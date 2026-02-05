import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { RecordCard } from './RecordCard';

const meta = {
  title: 'Features/Record/Mobile/RecordCard',
  component: RecordCard,
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
    title: { control: 'text' },
    description: { control: 'text' },
    date: { control: 'text' },
    location: { control: 'text' },
    tags: { control: 'object' },
    connections: { control: 'number' },
    isSelected: { control: 'boolean' },
    onViewDetail: { action: 'viewDetail' },
  },
} satisfies Meta<typeof RecordCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  title: '북한산 우이동 산책',
  description:
    '오늘 날씨가 좋아서 우이동에서 잠시 산책했다. 공기 좋고 조용해서 좋았다.',
  date: '2025.01.15',
  location: '서울 강북구 우이동',
  tags: ['등산', '산책'],
  onViewDetail: fn(),
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const Selected: Story = {
  args: {
    ...defaultArgs,
    isSelected: true,
    onViewDetail: fn(),
  },
};

export const WithConnections: Story = {
  args: {
    ...defaultArgs,
    connections: 3,
    isSelected: true,
    onViewDetail: fn(),
  },
};

export const LongContent: Story = {
  args: {
    ...defaultArgs,
    title: '북한산국립공원 우이동 탐방지원센터 주변 산책로 기록',
    description:
      '오늘 날씨가 좋아서 우이동에서 잠시 산책했다. 공기 좋고 조용해서 좋았다. 다음에는 더 오래 걸어보고 싶다. 가족과 함께 오면 좋을 것 같다.',
    tags: ['등산', '산책', '북한산', '우이동'],
    connections: 5,
    onViewDetail: fn(),
  },
};
