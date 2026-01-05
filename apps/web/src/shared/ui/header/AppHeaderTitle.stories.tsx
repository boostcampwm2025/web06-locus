import type { Meta, StoryObj } from '@storybook/react-vite';
import AppHeaderTitle from './AppHeaderTitle';

const meta = {
  title: 'Shared/UI/Header/AppHeaderTitle',
  component: AppHeaderTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOnline: {
      control: 'boolean',
      description: '온라인 상태 여부 (온라인: 초록색, 오프라인: 회색)',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof AppHeaderTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    isOnline: true,
  },
};

export const Offline: Story = {
  args: {
    isOnline: false,
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <AppHeaderTitle isOnline={true} />
      <AppHeaderTitle isOnline={false} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '온라인/오프라인 상태에 따라 원형 점의 색상이 변경됩니다.',
      },
    },
  },
};
