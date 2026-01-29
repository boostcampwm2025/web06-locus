import type { Meta, StoryObj } from '@storybook/react-vite';
import { PWAInstallGuide } from './PWAInstallGuide';
import { fn } from 'storybook/test';

const meta = {
  title: 'Shared/UI/PWA/PWAInstallGuide',
  component: PWAInstallGuide,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: '가이드 표시 여부',
    },
    onClose: {
      action: 'onClose',
      description: '닫기 버튼 또는 배경 클릭 시 호출',
    },
  },
} satisfies Meta<typeof PWAInstallGuide>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: fn(),
  },
};
