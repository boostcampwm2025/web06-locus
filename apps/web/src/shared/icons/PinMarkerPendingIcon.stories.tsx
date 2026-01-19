import type { Meta, StoryObj } from '@storybook/react-vite';
import { PinMarkerPendingIcon } from './Icons';

const meta = {
  title: 'Shared/Icons/PinMarkerPendingIcon',
  component: PinMarkerPendingIcon,
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
} satisfies Meta<typeof PinMarkerPendingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <PinMarkerPendingIcon className="w-14 h-20" />
      <PinMarkerPendingIcon className="w-28 h-40" />
      <PinMarkerPendingIcon className="w-42 h-60" />
    </div>
  ),
};
