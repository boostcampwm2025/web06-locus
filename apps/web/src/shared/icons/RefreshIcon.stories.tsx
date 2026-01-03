import type { Meta, StoryObj } from '@storybook/react';
import RefreshIcon from './RefreshIcon';

const meta = {
  title: 'Shared/Icons/RefreshIcon',
  component: RefreshIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind CSS classes for styling (size, color, etc.)',
    },
  },
} satisfies Meta<typeof RefreshIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithDifferentColors: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <RefreshIcon className="w-6 h-6 text-blue-500" />
      <RefreshIcon className="w-6 h-6 text-red-500" />
      <RefreshIcon className="w-6 h-6 text-green-500" />
      <RefreshIcon className="w-6 h-6 text-gray-500" />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    className:
      'w-8 h-8 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors',
    onClick: () => {
      alert('Refresh clicked!');
    },
  },
};
