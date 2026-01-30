import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationConfirmation } from './LocationConfirmation';
import { fn } from 'storybook/test';

const meta = {
  title: 'Shared/UI/Location/LocationConfirmation',
  component: LocationConfirmation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    location: {
      description: '위치 정보 (address 우선, 없으면 name, 없으면 기본값 표시)',
    },
    onConfirm: { action: 'onConfirm', description: '이 위치에 기록하기 클릭' },
    onCancel: { action: 'onCancel', description: '취소 클릭' },
  },
} satisfies Meta<typeof LocationConfirmation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    location: {
      name: '선택한 위치',
      address: '',
    },
    onConfirm: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative w-[500px] h-[400px] bg-gray-100">
        <Story />
      </div>
    ),
  ],
};

export const WithAddress: Story = {
  args: {
    location: {
      name: '서울시청',
      address: '서울특별시 중구 세종대로 110',
    },
    onConfirm: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative w-[500px] h-[400px] bg-gray-100">
        <Story />
      </div>
    ),
  ],
};

export const NameOnly: Story = {
  args: {
    location: {
      name: '현재 위치',
      address: '',
    },
    onConfirm: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative w-[500px] h-[400px] bg-gray-100">
        <Story />
      </div>
    ),
  ],
};
