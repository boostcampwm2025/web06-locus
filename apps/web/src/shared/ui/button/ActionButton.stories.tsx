import type { Meta, StoryObj } from '@storybook/react-vite';
import ActionButton from './ActionButton';

const meta = {
  title: 'Shared/UI/Button/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '기록 작성하기',
  },
  parameters: {
    docs: {
      description: {
        story: '주요 액션 버튼입니다. 어두운 배경에 흰색 텍스트.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '취소',
  },
  parameters: {
    docs: {
      description: {
        story: '보조 액션 버튼입니다. 밝은 배경에 어두운 텍스트.',
      },
    },
  },
};

export const ButtonGroup: Story = {
  args: {
    variant: 'primary',
    children: '기록 작성하기',
  },
  render: () => (
    <div className="flex w-80 flex-col gap-2.5">
      <ActionButton variant="primary">기록 작성하기</ActionButton>
      <ActionButton variant="secondary">취소</ActionButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '버튼 그룹 예시입니다.',
      },
    },
  },
};
